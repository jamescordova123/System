import { useState, useMemo } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { inquire } from '@/routes/public';
import { Search, BedDouble, Bath, Ruler, CheckCircle2, Building, DollarSign, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Property {
    id: number;
    title: string;
    description: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    type: string;
    image: string;
    purpose: 'buy' | 'rent';
    featured: boolean;
    tags: string[];
}

interface RentProps {
    properties: Property[];
}

export default function Rent({ properties }: RentProps) {
    const { props } = usePage();
    const { auth } = props as any;

    // Filter states
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [bedsFilter, setBedsFilter] = useState('All');
    const [priceRange, setPriceRange] = useState('All');

    // Selected property for modal
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Inquiry form state
    const { data, setData, post, processing, errors, reset } = useForm({
        property_id: 0,
        property_title: '',
        name: auth?.user?.name || '',
        email: auth?.user?.email || '',
        message: '',
    });

    // Handle Inquiry Submit
    const handleInquireSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.name || !data.email) {
            toast.error("Please fill in your name and email.");
            return;
        }

        post(inquire().url, {
            onSuccess: () => {
                toast.success("Your inquiry has been sent successfully!");
                reset('message');
                setDialogOpen(false);
            },
            onError: (err) => {
                console.error(err);
                toast.error("Failed to submit inquiry. Please try again.");
            }
        });
    };

    // Filter properties client-side
    const filteredProperties = useMemo(() => {
        return properties.filter((property) => {
            // Search text
            const matchesSearch = 
                property.title.toLowerCase().includes(search.toLowerCase()) ||
                property.location.toLowerCase().includes(search.toLowerCase());

            // Type
            const matchesType = typeFilter === 'All' || property.type === typeFilter;

            // Bedrooms
            let matchesBeds = true;
            if (bedsFilter !== 'All') {
                const requiredBeds = parseInt(bedsFilter, 10);
                matchesBeds = property.bedrooms >= requiredBeds;
            }

            // Price
            let matchesPrice = true;
            if (priceRange !== 'All') {
                if (priceRange === 'under-4k') matchesPrice = property.price < 4000;
                else if (priceRange === '4k-6k') matchesPrice = property.price >= 4000 && property.price <= 6000;
                else if (priceRange === 'over-6k') matchesPrice = property.price > 6000;
            }

            return matchesSearch && matchesType && matchesBeds && matchesPrice;
        });
    }, [properties, search, typeFilter, bedsFilter, priceRange]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <PublicLayout>
            <Head title="Rent Luxury Properties" />

            {/* Header Banner */}
            <div className="relative overflow-hidden bg-zinc-950 py-24 text-white dark:bg-zinc-950/40">
                {/* Background design elements */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950/10 to-transparent"></div>
                <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 ring-1 ring-red-500/20 ring-inset">
                        For Rent
                    </span>
                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Premium Properties for Rent
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
                        Find premium residential layouts, stylish urban apartments, and fully furnished homes for lease.
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-zinc-900/50">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        {/* Search Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Search</label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <Input
                                    type="text"
                                    placeholder="Enter location or title..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 dark:border-zinc-800 dark:bg-zinc-950"
                                />
                            </div>
                        </div>

                        {/* Property Type Dropdown */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Property Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                            >
                                <option value="All">All Types</option>
                                <option value="Villa">Villa</option>
                                <option value="House">House</option>
                                <option value="Apartment">Apartment</option>
                            </select>
                        </div>

                        {/* Bedrooms Filter */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Minimum Bedrooms</label>
                            <select
                                value={bedsFilter}
                                onChange={(e) => setBedsFilter(e.target.value)}
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                            >
                                <option value="All">Any Bedrooms</option>
                                <option value="1">1+ Bedrooms</option>
                                <option value="2">2+ Bedrooms</option>
                                <option value="3">3+ Bedrooms</option>
                                <option value="4">4+ Bedrooms</option>
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Monthly Rent</label>
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                            >
                                <option value="All">Any Rent</option>
                                <option value="under-4k">Under $4,000/mo</option>
                                <option value="4k-6k">$4,000 - $6,000/mo</option>
                                <option value="over-6k">Over $6,000/mo</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listings Grid */}
            <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                {filteredProperties.length === 0 ? (
                    <div className="py-20 text-center">
                        <Building className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                        <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">No properties found</h3>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProperties.map((property) => (
                            <div
                                key={property.id}
                                className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-900 dark:bg-zinc-900"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                                    <img
                                        src={property.image}
                                        alt={property.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {property.featured && (
                                        <Badge className="absolute top-4 left-4 bg-red-500 text-white hover:bg-red-600 border-none px-3 py-1 font-semibold text-xs tracking-wide">
                                            Featured
                                        </Badge>
                                    )}
                                    <Badge className="absolute top-4 right-4 bg-black/60 text-white border-none px-3 py-1 backdrop-blur-xs font-medium text-xs">
                                        {property.type}
                                    </Badge>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                        <MapPin className="h-4 w-4 text-red-500" />
                                        <span className="text-xs font-medium">{property.location}</span>
                                    </div>
                                    <h3 className="mt-2 text-lg font-bold text-zinc-900 group-hover:text-red-500 dark:text-white dark:group-hover:text-red-400 transition-colors">
                                        {property.title}
                                    </h3>
                                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                                        {property.description}
                                    </p>

                                    {/* Specs Icons */}
                                    <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                                        <div className="flex items-center gap-1">
                                            <BedDouble className="h-4 w-4 text-zinc-400" />
                                            <span>{property.bedrooms} Bed</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Bath className="h-4 w-4 text-zinc-400" />
                                            <span>{property.bathrooms} Bath</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Ruler className="h-4 w-4 text-zinc-400" />
                                            <span>{property.area} sqft</span>
                                        </div>
                                    </div>

                                    {/* Price & Action */}
                                    <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-zinc-800">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-zinc-400 dark:text-zinc-500">Rent</span>
                                            <span className="text-lg font-extrabold text-zinc-900 dark:text-white">
                                                {formatCurrency(property.price)} <span className="text-xs font-normal text-zinc-500">/mo</span>
                                            </span>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                setSelectedProperty(property);
                                                setData((prev) => ({
                                                    ...prev,
                                                    property_id: property.id,
                                                    property_title: property.title
                                                }));
                                                setDialogOpen(true);
                                            }}
                                            className="bg-red-500 text-white hover:bg-red-600 px-4 rounded-xl shadow-xs"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Property Detail Modal */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-3xl overflow-hidden rounded-2xl p-0 dark:border-zinc-800 dark:bg-zinc-950">
                    {selectedProperty && (
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Left Column: Image and Specs */}
                            <div className="relative aspect-[4/3] w-full bg-neutral-100 md:aspect-auto md:h-full">
                                <img
                                    src={selectedProperty.image}
                                    alt={selectedProperty.title}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <span className="inline-block rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                        {selectedProperty.type}
                                    </span>
                                    <h4 className="mt-2 text-xl font-bold">{selectedProperty.title}</h4>
                                    <p className="flex items-center gap-1 text-xs text-zinc-200">
                                        <MapPin className="h-3.5 w-3.5 text-red-500" />
                                        {selectedProperty.location}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Inquiry Form & Details */}
                            <div className="flex flex-col p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold dark:text-white">
                                        Property Details
                                    </DialogTitle>
                                    <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                                        Submit an inquiry to receive lease details and arrange a tour.
                                    </DialogDescription>
                                </DialogHeader>

                                {/* Specs Row */}
                                <div className="mt-4 flex justify-between rounded-xl bg-neutral-50 p-3 text-xs font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                                    <span>{selectedProperty.bedrooms} Bedrooms</span>
                                    <span>{selectedProperty.bathrooms} Bathrooms</span>
                                    <span>{selectedProperty.area} Sq Ft</span>
                                </div>

                                <p className="mt-4 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                                    {selectedProperty.description}
                                </p>

                                {/* Pricing */}
                                <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-zinc-900">
                                    <span className="text-xs text-zinc-400">Monthly Rent</span>
                                    <h5 className="text-2xl font-extrabold text-red-500 dark:text-red-400">
                                        {formatCurrency(selectedProperty.price)} <span className="text-xs font-normal text-zinc-400">/ month</span>
                                    </h5>
                                </div>

                                {/* Reverb Promo Alert */}
                                {auth?.user ? (
                                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400">
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                        <span className="text-[10px] font-medium leading-tight">
                                            Authenticated: sending inquiries will fire real-time Reverb toast notifications!
                                        </span>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-yellow-500/10 p-3 text-yellow-600 dark:bg-yellow-500/5 dark:text-yellow-400">
                                        <Building className="h-4 w-4 shrink-0" />
                                        <span className="text-[10px] font-medium leading-tight">
                                            Tip: Sign in to experience live WebSocket notifications on submissions.
                                        </span>
                                    </div>
                                )}

                                {/* Inquiry Form */}
                                <form onSubmit={handleInquireSubmit} className="mt-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Input
                                                type="text"
                                                placeholder="Your Name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="h-9 text-xs"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Input
                                                type="email"
                                                placeholder="Your Email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="h-9 text-xs"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Input
                                            type="text"
                                            placeholder="Write message (optional)..."
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg h-10 text-xs font-semibold shadow-xs"
                                    >
                                        {processing ? "Sending..." : "Submit Inquiry"}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PublicLayout>
    );
}
