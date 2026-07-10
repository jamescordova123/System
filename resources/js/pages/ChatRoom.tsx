import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, Link, useForm } from '@inertiajs/react';
import { index, store } from '@/routes/chat';
import {
    ArrowLeft,
    MessageSquareCode,
    Search,
    SendHorizontal,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar_url: string;
}

interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    body: string;
    created_at: string;
    sender?: User;
}

interface ChatRoomProps {
    auth: {
        user: User;
    };
    receiver: User | null;
    messages: Message[];
    users: User[];
}

// Synthesize a pleasant dual-tone chime sound via Web Audio API
const playNotificationSound = () => {
    try {
        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const audioCtx = new AudioContextClass();
        const playTone = (
            freq: number,
            startTime: number,
            duration: number,
        ) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        const now = audioCtx.currentTime;
        playTone(587.33, now, 0.08); // D5 chime
        playTone(880.0, now + 0.08, 0.2); // A5 chime
    } catch (e) {
        console.warn('Failed to play notification sound:', e);
    }
};

export default function ChatRoom({
    auth,
    receiver,
    messages,
    users,
}: ChatRoomProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [messagesList, setMessagesList] = useState<Message[]>(messages);
    const [mobileShowSidebar, setMobileShowSidebar] = useState(!receiver);
    const [mounted, setMounted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync state with updated page props from Inertia (e.g. when changing receivers or sending messages)
    useEffect(() => {
        setMessagesList(messages);
        setMobileShowSidebar(!receiver);
    }, [messages, receiver]);

    // Handle real-time incoming messages via Laravel Echo
    useEffect(() => {
        if (!auth.user.id) return;

        // Listen on the private channel unique to the authenticated user
        const channel = window.Echo.private(`chat.${auth.user.id}`);

        channel.listen('MessageSent', (event: Message) => {
            // Play notification sound
            playNotificationSound();

            // Append incoming message to state only if it belongs to the currently active conversation
            if (receiver && event.sender_id === receiver.id) {
                setMessagesList((prev) => [...prev, event]);
            }
        });

        return () => {
            window.Echo.leave(`chat.${auth.user.id}`);
        };
    }, [auth.user.id, receiver?.id]);

    // Automatically scroll to the bottom of the chat box
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messagesList]);

    // Inertia form submission for sending messages
    const { data, setData, post, processing, reset } = useForm({
        body: '',
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiver || !data.body.trim() || processing) return;

        post(store(receiver.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                reset('body');
            },
        });
    };

    // Filter contacts list based on search query
    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Human-friendly time formatter
    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    // Get initials for fallback avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <>
            <Head
                title={receiver ? `Chat with ${receiver.name}` : 'Chat System'}
            />

            <div className="m-5 flex h-[650px] max-h-[calc(100dvh-8rem)] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-background dark:border-sidebar-border">
                {/* 1. CONTACTS LIST (SIDEBAR) */}
                <div
                    className={`${
                        mobileShowSidebar ? 'flex' : 'hidden'
                    } h-full w-full shrink-0 flex-col overflow-hidden border-r border-sidebar-border/70 bg-card md:flex md:w-80 dark:border-sidebar-border`}
                >
                    <div className="border-b border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h2 className="mb-3 text-lg font-bold tracking-tight">
                            Chats
                        </h2>
                        <div className="relative">
                            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search contacts..."
                                className="bg-muted/30 pl-9 focus-visible:bg-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="scrollbar-none min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
                        {filteredUsers.length === 0 ? (
                            <div className="flex h-32 flex-col items-center justify-center text-center text-muted-foreground">
                                <span className="text-sm">
                                    No contacts found
                                </span>
                            </div>
                        ) : (
                            filteredUsers.map((u) => {
                                const isSelected = receiver?.id === u.id;
                                return (
                                    <Link
                                        key={u.id}
                                        href={index(u.id).url}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                                            isSelected
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'text-card-foreground hover:bg-muted/60'
                                        }`}
                                    >
                                        <Avatar className="h-10 w-10 border border-border/40">
                                            <AvatarImage
                                                src={u.avatar_url}
                                                alt={u.name}
                                            />
                                            <AvatarFallback
                                                className={
                                                    isSelected
                                                        ? 'bg-primary-foreground/10 text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                }
                                            >
                                                {getInitials(u.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`truncate text-sm font-semibold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}
                                            >
                                                {u.name}
                                            </p>
                                            <p
                                                className={`truncate text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                                            >
                                                {u.email}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 2. CHAT PANEL */}
                <div
                    className={`${
                        !mobileShowSidebar ? 'flex' : 'hidden'
                    } h-full min-h-0 flex-1 flex-col overflow-hidden bg-background md:flex`}
                >
                    {receiver ? (
                        <>
                            {/* CHAT HEADER */}
                            <div className="flex items-center gap-3 border-b border-sidebar-border/70 bg-card px-4 py-3 dark:border-sidebar-border">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() => setMobileShowSidebar(true)}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <Avatar className="h-9 w-9 border border-border/40">
                                    <AvatarImage
                                        src={receiver.avatar_url}
                                        alt={receiver.name}
                                    />
                                    <AvatarFallback className="bg-muted text-muted-foreground">
                                        {getInitials(receiver.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-sm leading-none font-bold text-foreground">
                                        {receiver.name}
                                    </h3>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {receiver.email}
                                    </p>
                                </div>
                            </div>

                            {/* CHAT MESSAGES SCROLL AREA */}
                            <div className="scrollbar-none min-h-0 flex-1 space-y-4 overflow-y-auto bg-muted/10 p-4">
                                {messagesList.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                            <MessageSquareCode className="h-6 w-6 text-primary" />
                                        </div>
                                        <p className="text-sm font-semibold text-foreground">
                                            No messages yet
                                        </p>
                                        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                                            Send a message to start your
                                            real-time conversation.
                                        </p>
                                    </div>
                                ) : (
                                    messagesList.map((msg, index) => {
                                        const isOutgoing =
                                            msg.sender_id === auth.user.id;
                                        return (
                                            <div
                                                key={msg.id || index}
                                                className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`flex max-w-[75%] flex-col md:max-w-[60%]`}
                                                >
                                                    <div
                                                        className={`px-4 py-2.5 text-sm shadow-xs ${
                                                            isOutgoing
                                                                ? 'rounded-2xl rounded-tr-none bg-primary text-primary-foreground'
                                                                : 'rounded-2xl rounded-tl-none border border-border/50 bg-card text-card-foreground'
                                                        }`}
                                                    >
                                                        <p className="break-words whitespace-pre-wrap">
                                                            {msg.body}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`mt-1 px-1 text-[10px] text-muted-foreground/80 select-none ${
                                                            isOutgoing
                                                                ? 'text-right'
                                                                : 'text-left'
                                                        }`}
                                                    >
                                                        {mounted
                                                            ? formatTime(
                                                                  msg.created_at,
                                                              )
                                                            : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* CHAT INPUT BAR */}
                            <form
                                onSubmit={handleSendMessage}
                                className="flex items-center gap-2 border-t border-sidebar-border/70 bg-card p-3 dark:border-sidebar-border"
                            >
                                <Input
                                    placeholder={`Message ${receiver.name}...`}
                                    value={data.body}
                                    onChange={(e) =>
                                        setData('body', e.target.value)
                                    }
                                    disabled={processing}
                                    maxLength={5000}
                                    className="flex-1 bg-muted/30 focus-visible:bg-transparent"
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!data.body.trim() || processing}
                                    className="shrink-0"
                                >
                                    <SendHorizontal className="h-4.5 w-4.5" />
                                </Button>
                            </form>
                        </>
                    ) : (
                        /* EMPTY CHAT SCREEN (NO RECEIVER SELECTED) */
                        <div className="flex flex-1 flex-col items-center justify-center bg-muted/5 p-8 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                                <MessageSquareCode className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">
                                Real-Time Messaging
                            </h3>
                            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                                Select a contact from the list on the left to
                                start a real-time, one-on-one chat session.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// Attach page breadcrumbs mapping for standard layout navigation
ChatRoom.layout = {
    breadcrumbs: [
        {
            title: 'Chat',
            href: '/chat',
        },
    ],
};
