import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Key,
    Copy,
    Check,
    Trash2,
    ShieldAlert,
    KeyRound,
    Clock,
    Calendar,
    Plus,
} from 'lucide-react';
import type { ApiToken } from '@/types';
import {
    store as storeRoute,
    destroy as destroyRoute,
    index as apiTokensIndex,
} from '@/routes/api-tokens';

interface Props {
    tokens: ApiToken[];
    plainTextToken: string | null;
}

const AVAILABLE_ABILITIES = [
    {
        id: 'read',
        label: 'Read Access',
        description: 'Allows viewing and fetching resources.',
    },
    {
        id: 'write',
        label: 'Write Access',
        description: 'Allows creating and updating resources.',
    },
    {
        id: 'delete',
        label: 'Delete Access',
        description: 'Allows removing resources.',
    },
];

export default function ApiTokensIndex({ tokens, plainTextToken }: Props) {
    const [copied, setCopied] = useState(false);
    const [revokingId, setRevokingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        abilities: [] as string[],
    });

    const handleAbilityChange = (ability: string, checked: boolean) => {
        if (checked) {
            setData('abilities', [...data.abilities, ability]);
        } else {
            setData(
                'abilities',
                data.abilities.filter((a) => a !== ability),
            );
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(storeRoute().url, {
            preserveScroll: true,
            onSuccess: () => {
                reset('name', 'abilities');
            },
        });
    };

    const revokeToken = (tokenId: number) => {
        if (
            confirm(
                'Are you sure you want to revoke this API token? It will be permanently deleted.',
            )
        ) {
            setRevokingId(tokenId);
            router.delete(destroyRoute(tokenId).url, {
                preserveScroll: true,
                onFinish: () => setRevokingId(null),
            });
        }
    };

    return (
        <>
            <Head title="API Tokens" />

            <h1 className="sr-only">API Tokens</h1>

            <div className="space-y-8">
                <Heading
                    variant="small"
                    title="API Tokens"
                    description="Personal access tokens allow external services to securely authenticate and interact with our API on your behalf."
                />

                {plainTextToken && (
                    <Alert className="border-red-500/50 bg-red-500/5 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                        <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-500" />
                        <div className="flex-1 space-y-2">
                            <AlertTitle className="flex items-center gap-2 font-bold">
                                New Token Generated
                                <Badge
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-600/90"
                                >
                                    Copy Now
                                </Badge>
                            </AlertTitle>
                            <AlertDescription className="text-sm font-medium">
                                <p className="mb-3 text-muted-foreground">
                                    For security, this token will only be shown
                                    once. Copy it now.
                                </p>
                                <div className="flex items-center gap-2 rounded-lg border border-dashed border-red-300 bg-neutral-100 p-3 font-mono text-sm break-all text-neutral-900 select-all dark:border-red-800 dark:bg-neutral-900 dark:text-neutral-100">
                                    <span className="flex-1 select-all">
                                        {plainTextToken}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={() =>
                                            copyToClipboard(plainTextToken)
                                        }
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="mr-1 h-4 w-4 text-green-600 dark:text-green-500" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="mr-1 h-4 w-4" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </AlertDescription>
                        </div>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Key className="h-4.5 w-4.5 text-muted-foreground" />
                            Create API Token
                        </CardTitle>
                        <CardDescription>
                            Generate a new personal access token to authorize
                            API requests.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Token Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="e.g., Development Server, GitHub Actions"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-3 pt-2">
                                <Label>API Scopes / Permissions</Label>
                                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                                    {AVAILABLE_ABILITIES.map((ability) => (
                                        <div
                                            key={ability.id}
                                            className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <Checkbox
                                                id={`ability-${ability.id}`}
                                                checked={data.abilities.includes(
                                                    ability.id,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleAbilityChange(
                                                        ability.id,
                                                        !!checked,
                                                    )
                                                }
                                                className="mt-1"
                                            />
                                            <div className="grid gap-0.5">
                                                <Label
                                                    htmlFor={`ability-${ability.id}`}
                                                    className="cursor-pointer font-semibold"
                                                >
                                                    {ability.label}
                                                </Label>
                                                <span className="text-xs text-muted-foreground">
                                                    {ability.description}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.abilities} />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end border-t px-6 py-4">
                            <Button type="submit" disabled={processing}>
                                <Plus className="mr-1.5 h-4 w-4" />
                                Generate Token
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Active Tokens
                        </CardTitle>
                        <CardDescription>
                            Active personal access tokens currently associated
                            with your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tokens.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                                <KeyRound className="mb-2 h-8 w-8 opacity-50" />
                                <p className="text-sm font-medium">
                                    No active tokens found
                                </p>
                                <p className="text-xs">
                                    Generate a token above to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[180px]">
                                                Token Name
                                            </TableHead>
                                            <TableHead>Abilities</TableHead>
                                            <TableHead className="w-[130px]">
                                                Last Used
                                            </TableHead>
                                            <TableHead className="w-[130px]">
                                                Created
                                            </TableHead>
                                            <TableHead className="w-[100px] text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tokens.map((token) => (
                                            <TableRow key={token.id}>
                                                <TableCell className="font-semibold text-foreground">
                                                    {token.name}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {token.abilities.map(
                                                            (ability) => (
                                                                <Badge
                                                                    key={
                                                                        ability
                                                                    }
                                                                    variant="secondary"
                                                                    className="px-1.5 py-0.5 text-[10px] capitalize"
                                                                >
                                                                    {ability}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {token.last_used_at_diff ? (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {
                                                                token.last_used_at_diff
                                                            }
                                                        </span>
                                                    ) : (
                                                        'Never'
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {token.created_at_diff}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-8 px-2"
                                                        disabled={
                                                            revokingId ===
                                                            token.id
                                                        }
                                                        onClick={() =>
                                                            revokeToken(
                                                                token.id,
                                                            )
                                                        }
                                                    >
                                                        {revokingId ===
                                                        token.id ? (
                                                            'Revoking...'
                                                        ) : (
                                                            <>
                                                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                                Revoke
                                                            </>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ApiTokensIndex.layout = {
    breadcrumbs: [
        {
            title: 'API Tokens',
            href: apiTokensIndex(),
        },
    ],
};
