<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreActionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Enforce that the user must be authenticated
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'action_type' => [
                'required',
                'string',
                Rule::in(['delete_request', 'return_item', 'accept_transaction']),
            ],
            'reason' => [
                'required',
                'string',
                'min:10',
            ],
            'actionable_type' => [
                'required',
                'string',
            ],
            'actionable_id' => [
                'required',
                'integer',
            ],
            'sensitive_tracking_data' => [
                'nullable',
                'string',
                'max:65535',
            ],
            'attachment' => [
                'nullable',
                'file',
                'mimes:jpeg,png,webp,gif,pdf,doc,docx,xls,xlsx,txt',
                'max:10240', // 10MB limit
            ],
            'recipient_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'action_type.in' => 'The selected action type is invalid. Choose from: delete_request, return_item, or accept_transaction.',
            'reason.min' => 'Please provide a detailed justification (at least 10 characters) for this action request.',
        ];
    }
}
