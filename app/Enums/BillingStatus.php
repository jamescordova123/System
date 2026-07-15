<?php

namespace App\Enums;

enum BillingStatus: string
{
    case Paid = 'paid';
    case Unpaid = 'unpaid';
    case Partial = 'partial';
}
