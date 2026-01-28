<?php

namespace App\Http\Requests\Reports;

use Illuminate\Foundation\Http\FormRequest;

class CancellationRateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Adjust if you have policies or role checks
        return true;
    }

    /**
     * Validation rules.
     */
    public function rules(): array
    {
        return [
            'start_date' => ['required', 'date', 'before_or_equal:end_date'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'start_date.required' => 'Start date is required.',
            'start_date.date' => 'Start date must be a valid date.',
            'start_date.before_or_equal' => 'Start date must be before or equal to end date.',

            'end_date.required' => 'End date is required.',
            'end_date.date' => 'End date must be a valid date.',
            'end_date.after_or_equal' => 'End date must be after or equal to start date.',
        ];
    }

    /**
     * Optional helper to access validated range data.
     */
    public function validatedRange(): array
    {
        return [
            'start_date' => $this->validated('start_date'),
            'end_date'   => $this->validated('end_date'),
        ];
    }
}
