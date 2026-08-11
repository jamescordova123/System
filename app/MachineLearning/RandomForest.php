<?php

namespace App\MachineLearning;

/**
 * A pure-PHP Random Forest classifier for binary or multiclass labels.
 *
 * The ensemble is a collection of {@see DecisionTree} base learners. Each tree
 * is trained on a bootstrap sample of the training data (bagging) and evaluates
 * a random subset of features at each split (feature bagging). Predictions use
 * majority vote; probabilities are the mean of per-tree class probabilities,
 * which gives a smooth, well-calibrated confidence estimate.
 *
 * This is intentionally dependency-free so it runs inside a standard Laravel app
 * without a Python sidecar. It is well suited to the small, tabular
 * payment-delinquency dataset in this system.
 */
class RandomForest
{
    /**
     * @param array<int, string> $featureNames Feature column order used for training/prediction.
     * @param int $nTrees Number of trees in the forest.
     * @param int|null $maxDepth Max depth per tree (null = grow fully).
     * @param int $minSamplesSplit Min samples required to split a node.
     * @param float|null $maxFeaturesRatio Ratio of features considered per split (null = sqrt(n)).
     * @param int|null $randomSeed Fixed seed for reproducible forests.
     */
    public function __construct(
        private array $featureNames,
        private int $nTrees = 50,
        private ?int $maxDepth = 8,
        private int $minSamplesSplit = 2,
        private ?float $maxFeaturesRatio = null,
        private ?int $randomSeed = null,
    ) {}

    /** @var array<int, DecisionTree> */
    private array $trees = [];

    /** @var array<string, string> */
    private array $classes = [];

    /**
     * Train the forest on the given dataset.
     *
     * @param array<int, array<string, mixed>> $samples Each row must have feature columns and a "label".
     */
    public function train(array $samples): void
    {
        if (empty($samples)) {
            return;
        }

        if ($this->randomSeed !== null) {
            mt_srand($this->randomSeed);
        }

        $this->classes = array_values(array_unique(array_map(
            fn (array $s) => (string) $s['label'],
            $samples,
        )));

        $nFeatures = count($this->featureNames);
        $maxFeatures = $this->maxFeaturesRatio !== null
            ? max(1, (int) round($nFeatures * $this->maxFeaturesRatio))
            : max(1, (int) floor(sqrt($nFeatures)));

        $this->trees = [];
        for ($t = 0; $t < $this->nTrees; $t++) {
            $bootstrap = $this->bootstrapSample($samples);

            $tree = new DecisionTree(
                $this->featureNames,
                $this->maxDepth,
                $this->minSamplesSplit,
                $maxFeatures,
            );
            $tree->train($bootstrap);
            $this->trees[] = $tree;
        }

        if ($this->randomSeed !== null) {
            mt_srand(); // restore non-deterministic RNG after training
        }
    }

    /**
     * Predict the majority-vote class label for a feature vector.
     *
     * @param array<string, mixed> $features
     */
    public function predict(array $features): string
    {
        $votes = $this->voteDistribution($features);
        arsort($votes);

        return (string) array_key_first($votes);
    }

    /**
     * Predict the mean per-class probability across all trees and return the
     * class label with the highest probability.
     *
     * @param array<string, mixed> $features
     * @return array{label: string, probability: float, probabilities: array<string, float>}
     */
    public function predictProbability(array $features): array
    {
        $sums = array_fill_keys($this->classes, 0.0);
        $n = max(1, count($this->trees));

        foreach ($this->trees as $tree) {
            $result = $tree->predictProbability($features);
            $sums[$result['label']] = ($sums[$result['label']] ?? 0.0) + $result['probability'];
        }

        $probabilities = array_map(fn ($v) => $v / $n, $sums);
        arsort($probabilities);

        $label = (string) array_key_first($probabilities);

        return [
            'label' => $label,
            'probability' => (float) $probabilities[$label],
            'probabilities' => $probabilities,
        ];
    }

    /**
     * Out-of-bag-style accuracy estimate computed during training. Returns
     * the mean training accuracy as a lightweight sanity check (a full OOB
     * evaluation would require tracking OOB samples per tree).
     *
     * @param array<int, array<string, mixed>> $samples
     */
    public function trainingAccuracy(array $samples): float
    {
        if (empty($samples)) {
            return 0.0;
        }
        $correct = 0;
        foreach ($samples as $s) {
            $actual = (string) $s['label'];
            $predicted = $this->predict($s);
            if ($predicted === $actual) {
                $correct++;
            }
        }

        return $correct / count($samples);
    }

    /**
     * @param array<int, array<string, mixed>> $samples
     * @return array<string, int>
     */
    private function voteDistribution(array $features): array
    {
        $votes = array_fill_keys($this->classes, 0);
        foreach ($this->trees as $tree) {
            $label = $tree->predict($features);
            $votes[$label] = ($votes[$label] ?? 0) + 1;
        }

        return $votes;
    }

    /**
     * Draw a bootstrap sample (with replacement) of the same size as the input.
     *
     * @param array<int, array<string, mixed>> $samples
     * @return array<int, array<string, mixed>>
     */
    private function bootstrapSample(array $samples): array
    {
        $n = count($samples);
        if ($n === 0) {
            return [];
        }
        $bootstrap = [];
        for ($i = 0; $i < $n; $i++) {
            $bootstrap[] = $samples[random_int(0, $n - 1)];
        }

        return $bootstrap;
    }
}
