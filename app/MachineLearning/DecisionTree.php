<?php

namespace App\MachineLearning;

/**
 * A minimal CART (classification and regression trees) decision tree
 * implementation. Used as the base learner for the RandomForest ensemble.
 *
 * The tree uses Gini impurity for split selection, supports a random subset
 * of features at each node (feature bagging), and grows fully by default with
 * optional max depth / min samples constraints. It predicts both the class
 * label and a probability estimate derived from the class distribution of the
 * leaf node.
 */
class DecisionTree
{
    /**
     * @param array<int, string> $featureNames Feature column order the tree was trained on.
     * @param int|null $maxDepth Maximum tree depth (null = unlimited).
     * @param int $minSamplesSplit Minimum samples required to split a node.
     * @param int|null $maxFeatures Number of features considered per split (null = all).
     */
    public function __construct(
        private array $featureNames,
        private ?int $maxDepth = null,
        private int $minSamplesSplit = 2,
        private ?int $maxFeatures = null,
    ) {}

    /** @var array<string, mixed>|null */
    private ?array $root = null;

    /**
     * Train the tree on a dataset.
     *
     * @param array<int, array<string, mixed>> $samples Each row must have feature columns and a "label".
     */
    public function train(array $samples): void
    {
        $this->root = $this->buildNode($samples, $depth = 0);
    }

    /**
     * Predict the class label for a single feature vector.
     *
     * @param array<string, mixed> $features
     */
    public function predict(array $features): string
    {
        return $this->predictNode($this->root, $features);
    }

    /**
     * Predict the class label and a probability for that class.
     *
     * @param array<string, mixed> $features
     * @return array{label: string, probability: float}
     */
    public function predictProbability(array $features): array
    {
        $leaf = $this->resolveLeaf($this->root, $features);
        $total = array_sum($leaf['distribution']) ?: 1;
        $label = $leaf['label'];
        $probability = $leaf['distribution'][$label] / $total;

        return ['label' => $label, 'probability' => (float) $probability];
    }

    /**
     * Recursively build a tree node.
     *
     * @param array<int, array<string, mixed>> $samples
     * @return array<string, mixed>
     */
    private function buildNode(array $samples, int $depth): array
    {
        $labelCounts = $this->countLabels($samples);
        $label = $this->majorityLabel($labelCounts);
        $gini = $this->gini($labelCounts, count($samples));

        $node = [
            'leaf' => true,
            'label' => $label,
            'distribution' => $labelCounts,
            'gini' => $gini,
            'n' => count($samples),
        ];

        // Stop growing: pure node, depth limit, too few samples, or no features.
        if ($gini === 0.0) {
            return $node;
        }
        if ($this->maxDepth !== null && $depth >= $this->maxDepth) {
            return $node;
        }
        if (count($samples) < $this->minSamplesSplit) {
            return $node;
        }

        $split = $this->findBestSplit($samples);
        if ($split === null) {
            return $node;
        }

        [$feature, $threshold, $left, $right] = $split;
        if (empty($left) || empty($right)) {
            return $node;
        }

        return [
            'leaf' => false,
            'label' => $label,
            'distribution' => $labelCounts,
            'feature' => $feature,
            'threshold' => $threshold,
            'left' => $this->buildNode($left, $depth + 1),
            'right' => $this->buildNode($right, $depth + 1),
            'n' => count($samples),
        ];
    }

    /**
     * Find the best (lowest weighted Gini) split for the given samples.
     *
     * @param array<int, array<string, mixed>> $samples
     * @return array{0:string,1:float,2:array,3:array}|null
     */
    private function findBestSplit(array $samples): ?array
    {
        $featureCandidates = $this->featureNames;
        if ($this->maxFeatures !== null && $this->maxFeatures < count($featureCandidates)) {
            shuffle($featureCandidates);
            $featureCandidates = array_slice($featureCandidates, 0, $this->maxFeatures);
        }

        $bestGini = INF;
        $bestSplit = null;

        foreach ($featureCandidates as $feature) {
            $values = array_unique(array_map(
                fn (array $s) => (float) $s[$feature],
                $samples,
            ));
            sort($values);
            if (count($values) < 2) {
                continue;
            }

            // Consider midpoints between consecutive sorted unique values as
            // candidate thresholds to keep split evaluation tractable.
            for ($i = 0; $i < count($values) - 1; $i++) {
                $threshold = ($values[$i] + $values[$i + 1]) / 2;

                [$left, $right] = $this->partition($samples, $feature, $threshold);
                if (empty($left) || empty($right)) {
                    continue;
                }

                $leftCounts = $this->countLabels($left);
                $rightCounts = $this->countLabels($right);
                $nLeft = count($left);
                $nRight = count($right);
                $total = $nLeft + $nRight;

                $weighted = ($nLeft / $total) * $this->gini($leftCounts, $nLeft)
                    + ($nRight / $total) * $this->gini($rightCounts, $nRight);

                if ($weighted < $bestGini) {
                    $bestGini = $weighted;
                    $bestSplit = [$feature, $threshold, $left, $right];
                }
            }
        }

        return $bestSplit;
    }

    /**
     * @param array<int, array<string, mixed>> $samples
     * @return array<string, int>
     */
    private function partition(array $samples, string $feature, float $threshold): array
    {
        $left = [];
        $right = [];
        foreach ($samples as $s) {
            if ((float) $s[$feature] <= $threshold) {
                $left[] = $s;
            } else {
                $right[] = $s;
            }
        }

        return [$left, $right];
    }

    /**
     * @param array<int, array<string, mixed>> $samples
     * @return array<string, int>
     */
    private function countLabels(array $samples): array
    {
        $counts = [];
        foreach ($samples as $s) {
            $label = (string) $s['label'];
            $counts[$label] = ($counts[$label] ?? 0) + 1;
        }

        return $counts;
    }

    /**
     * @param array<string, int> $counts
     */
    private function gini(array $counts, int $total): float
    {
        if ($total === 0) {
            return 0.0;
        }
        $sum = 0.0;
        foreach ($counts as $count) {
            $p = $count / $total;
            $sum += $p * $p;
        }

        return 1.0 - $sum;
    }

    /**
     * @param array<string, int> $counts
     */
    private function majorityLabel(array $counts): string
    {
        if (empty($counts)) {
            return '';
        }
        arsort($counts);

        return (string) array_key_first($counts);
    }

    private function predictNode(?array $node, array $features): string
    {
        return $this->resolveLeaf($node, $features)['label'];
    }

    private function resolveLeaf(?array $node, array $features): array
    {
        if ($node === null) {
            return ['label' => '', 'distribution' => []];
        }
        if ($node['leaf']) {
            return $node;
        }

        $value = (float) $features[$node['feature']];

        return $this->resolveLeaf(
            $value <= $node['threshold'] ? $node['left'] : $node['right'],
            $features,
        );
    }
}
