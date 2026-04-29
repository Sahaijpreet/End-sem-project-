import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

export default function PasswordStrengthIndicator({ password, onValidationChange }) {
  const [validation, setValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
  });

  const [strength, setStrength] = useState(0);

  useEffect(() => {
    const newValidation = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setValidation(newValidation);

    const validCount = Object.values(newValidation).filter(Boolean).length;
    setStrength(validCount);

    const isValid = Object.values(newValidation).every(Boolean);
    onValidationChange?.(isValid);
  }, [password, onValidationChange]);

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-ink-800">Password Strength</span>
          <span className={`font-medium ${
            strength <= 2 ? 'text-red-600' :
            strength <= 3 ? 'text-yellow-600' :
            strength <= 4 ? 'text-blue-600' : 'text-green-600'
          }`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-parchment-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink-800">Password Requirements:</p>
        <div className="grid grid-cols-1 gap-1 text-sm">
          <RequirementItem 
            met={validation.minLength} 
            text="At least 8 characters" 
          />
          <RequirementItem 
            met={validation.hasUpperCase} 
            text="One uppercase letter" 
          />
          <RequirementItem 
            met={validation.hasLowerCase} 
            text="One lowercase letter" 
          />
          <RequirementItem 
            met={validation.hasNumbers} 
            text="One number" 
          />
          <RequirementItem 
            met={validation.hasSpecialChar} 
            text="One special character" 
          />
        </div>
      </div>
    </div>
  );
}

function RequirementItem({ met, text }) {
  return (
    <div className={`flex items-center gap-2 ${
      met ? 'text-green-600' : 'text-ink-600'
    }`}>
      {met ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
      <span className="text-sm">{text}</span>
    </div>
  );
}