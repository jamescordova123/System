<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicPropertyController extends Controller
{
    private function getProperties(): array
    {
        return [
            // Properties for Sale (Buy)
            [
                'id' => 1,
                'title' => 'Serenity Modern Villa',
                'description' => 'A breathtaking architectural masterpiece featuring clean lines, floor-to-ceiling glass, and an infinity pool overlooking the ocean.',
                'price' => 2450000,
                'location' => 'Malibu, CA',
                'bedrooms' => 5,
                'bathrooms' => 6,
                'area' => 5200,
                'type' => 'Villa',
                'image' => 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
                'purpose' => 'buy',
                'featured' => true,
                'tags' => ['Oceanfront', 'Infinity Pool', 'Smart Home']
            ],
            [
                'id' => 2,
                'title' => 'Skyline Penthouse',
                'description' => 'Experience the epitome of luxury urban living in this expansive duplex penthouse with panoramic views of the city skyline.',
                'price' => 3800000,
                'location' => 'Manhattan, NY',
                'bedrooms' => 3,
                'bathrooms' => 3.5,
                'area' => 3100,
                'type' => 'Penthouse',
                'image' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
                'purpose' => 'buy',
                'featured' => true,
                'tags' => ['City Views', 'Duplex', 'Private Elevator']
            ],
            [
                'id' => 3,
                'title' => 'The Redwood Estate',
                'description' => 'An elegant traditional manor nestled in a lush, private redwood forest setting with premium details and design throughout.',
                'price' => 1890000,
                'location' => 'Los Gatos, CA',
                'bedrooms' => 4,
                'bathrooms' => 4.5,
                'area' => 4600,
                'type' => 'House',
                'image' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
                'purpose' => 'buy',
                'featured' => false,
                'tags' => ['Acreage', 'Wine Cellar', 'Forest View']
            ],
            [
                'id' => 4,
                'title' => 'Minimalist Oasis',
                'description' => 'A stunning architectural statement showcasing exposed concrete, natural wood, and light-filled open-plan spaces.',
                'price' => 1550000,
                'location' => 'Austin, TX',
                'bedrooms' => 3,
                'bathrooms' => 3,
                'area' => 2800,
                'type' => 'House',
                'image' => 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
                'purpose' => 'buy',
                'featured' => false,
                'tags' => ['Minimalist', 'Solar Panels', 'Eco-Friendly']
            ],
            [
                'id' => 5,
                'title' => 'Coastal Luxury Condo',
                'description' => 'Beautifully designed high-rise condominium unit with direct access to private beaches and resort-style amenities.',
                'price' => 950000,
                'location' => 'Miami Beach, FL',
                'bedrooms' => 2,
                'bathrooms' => 2,
                'area' => 1450,
                'type' => 'Apartment',
                'image' => 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
                'purpose' => 'buy',
                'featured' => false,
                'tags' => ['Beach Access', 'Concierge', 'Pool']
            ],

            // Properties for Rent (Rent)
            [
                'id' => 6,
                'title' => 'Sunset Heights Villa',
                'description' => 'An stunning hillside villa offering spectacular sunset views, open terrace layouts, and a modern design.',
                'price' => 8500,
                'location' => 'Hollywood Hills, CA',
                'bedrooms' => 4,
                'bathrooms' => 4,
                'area' => 3900,
                'type' => 'Villa',
                'image' => 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
                'purpose' => 'rent',
                'featured' => true,
                'tags' => ['Pool', 'Furnished', 'Panoramic Views']
            ],
            [
                'id' => 7,
                'title' => 'Urban Brick Loft',
                'description' => 'Charming and spacious industrial loft featuring exposed brick walls, timber beams, and high ceilings in the heart of downtown.',
                'price' => 4200,
                'location' => 'Chicago, IL',
                'bedrooms' => 2,
                'bathrooms' => 2,
                'area' => 1800,
                'type' => 'Apartment',
                'image' => 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
                'purpose' => 'rent',
                'featured' => true,
                'tags' => ['Industrial', 'Exposed Brick', 'Pets Allowed']
            ],
            [
                'id' => 8,
                'title' => 'Modern Waterfront Studio',
                'description' => 'A chic and compact studio apartment overlooking the harbor, fully optimized for space and luxury living.',
                'price' => 3100,
                'location' => 'Boston, MA',
                'bedrooms' => 1,
                'bathrooms' => 1,
                'area' => 750,
                'type' => 'Apartment',
                'image' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
                'purpose' => 'rent',
                'featured' => false,
                'tags' => ['Waterfront', 'Gym Access', 'Modern Interior']
            ],
            [
                'id' => 9,
                'title' => 'Charming Craftsman Home',
                'description' => 'A warm, inviting historic craftsman house with a large backyard patio, fully updated kitchen and charming fireplace.',
                'price' => 5500,
                'location' => 'Seattle, WA',
                'bedrooms' => 3,
                'bathrooms' => 2.5,
                'area' => 2200,
                'type' => 'House',
                'image' => 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
                'purpose' => 'rent',
                'featured' => false,
                'tags' => ['Backyard', 'Fireplace', 'Quiet Street']
            ],
            [
                'id' => 10,
                'title' => 'Glass & Concrete Townhouse',
                'description' => 'A cutting-edge modern townhouse with multi-level outdoor balconies, premium built-in appliances and stunning glass stairways.',
                'price' => 7200,
                'location' => 'San Francisco, CA',
                'bedrooms' => 3,
                'bathrooms' => 3.5,
                'area' => 2900,
                'type' => 'House',
                'image' => 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
                'purpose' => 'rent',
                'featured' => false,
                'tags' => ['Roof Deck', 'Garage', 'Multi-Level']
            ]
        ];
    }

    public function buy(): Response
    {
        $properties = collect($this->getProperties())->where('purpose', 'buy')->values()->all();
        
        return Inertia::render('buy', [
            'properties' => $properties
        ]);
    }

    public function rent(): Response
    {
        $properties = collect($this->getProperties())->where('purpose', 'rent')->values()->all();

        return Inertia::render('rent', [
            'properties' => $properties
        ]);
    }

    public function inquire(Request $request)
    {
        $request->validate([
            'property_id' => 'required|integer',
            'property_title' => 'required|string',
            'name' => 'required|string',
            'email' => 'required|email',
            'message' => 'nullable|string',
        ]);

        $user = auth()->user();

        // If user is logged in, we dispatch a real-time notification to demonstrate Reverb!
        if ($user) {
            $user->notifyTransaction([
                'id' => 'INQ-' . strtoupper(str_random(8)),
                'amount' => '0.00',
                'currency' => 'USD',
                'status' => 'success',
                'message' => "Inquiry sent for: '{$request->input('property_title')}'! Our agent will contact you shortly."
            ]);
        }

        return back()->with('success', 'Thank you! Your inquiry has been submitted successfully.');
    }
}
