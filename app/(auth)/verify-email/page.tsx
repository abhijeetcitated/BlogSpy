'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-blue-500" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Check your inbox</p>
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to verify your account.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Check spam folder</p>
                <p className="text-sm text-muted-foreground">
                  If you don't see it, check your spam or junk folder.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?
            </p>
            <Button variant="outline" className="w-full">
              Resend verification email
            </Button>
          </div>
          
          <div className="text-center">
            <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
