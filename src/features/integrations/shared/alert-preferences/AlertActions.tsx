'use client';

/**
 * Alert Actions Component
 * @description Save preferences and send test alert buttons
 */

import { Button } from '@/components/ui/button';
import { Send, Loader2, CheckCircle } from 'lucide-react';

interface AlertActionsProps {
  isSaving: boolean;
  isSendingTest: boolean;
  saveSuccess: boolean;
  canSendTest: boolean;
  onSave: () => void;
  onSendTest: () => void;
}

export function AlertActions({
  isSaving,
  isSendingTest,
  saveSuccess,
  canSendTest,
  onSave,
  onSendTest,
}: AlertActionsProps) {
  return (
    <div className="flex items-center justify-between pt-4">
      <Button
        variant="outline"
        onClick={onSendTest}
        disabled={isSendingTest || !canSendTest}
      >
        {isSendingTest ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Test Alert
          </>
        )}
      </Button>

      <Button onClick={onSave} disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : saveSuccess ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Saved!
          </>
        ) : (
          'Save Preferences'
        )}
      </Button>
    </div>
  );
}
