<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Registrar = 'registrar';
    case Cashier = 'cashier';
    case Student = 'student';
}
