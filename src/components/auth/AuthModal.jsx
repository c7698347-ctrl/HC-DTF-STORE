'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Smartphone, Mail, ArrowRight, ShieldCheck, RefreshCw, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, sendOtpApi, verifyOtpAndLogin } = useStore();

  const [otpType, setOtpType] = useState('mobile'); // 'mobile' or 'email'
  const [identifier, setIdentifier] = useState('');
  
  // OTP Step States
  const [step, setStep] = useState('input'); // 'input', 'otp'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [devOtpCode, setDevOtpCode] = useState('');

  // UI Statuses
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 30-Second Resend Countdown Timer
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const digitRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Countdown timer logic
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isAuthOpen) return null;

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanIdent = identifier.trim();
    if (!cleanIdent) {
      setErrorMsg(otpType === 'mobile' ? 'Please enter a valid 10-digit mobile number' : 'Please enter a valid email address');
      return;
    }

    if (otpType === 'mobile' && cleanIdent.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    const res = await sendOtpApi({ identifier: cleanIdent, type: otpType });
    setIsLoading(false);

    if (res.success) {
      setStep('otp');
      setCountdown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      if (res.devOtpCode) {
        setDevOtpCode(res.devOtpCode);
      }
      setTimeout(() => {
        digitRefs[0].current?.focus();
      }, 100);
    } else {
      setErrorMsg(res.error || 'Failed to send OTP code');
    }
  };

  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      // Auto-paste handler
      const pastedDigits = value.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newDigits[i] = digit;
      });
      setOtpDigits(newDigits);
      if (newDigits.every(d => d !== '')) {
        handleVerifyOtp(newDigits.join(''));
      }
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-advance to next box
    if (value !== '' && index < 5) {
      digitRefs[index + 1].current?.focus();
    }

    // Auto-verify when 6th digit is entered
    if (newDigits.every(d => d !== '') && value !== '') {
      handleVerifyOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (codeToVerify) => {
    const fullCode = codeToVerify || otpDigits.join('');
    if (fullCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    const res = await verifyOtpAndLogin({
      identifier: identifier.trim(),
      type: otpType,
      otpCode: fullCode
    });

    setIsLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsAuthOpen(false);
        setStep('input');
        setIsSuccess(false);
      }, 1000);
    } else {
      setErrorMsg(res.error || 'Invalid 6-digit OTP code entered');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md" onClick={() => setIsAuthOpen(false)} />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 font-black text-xl shadow-md shadow-emerald-600/30">
            HC
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 'input' ? 'Customer Sign In' : 'Verify OTP Code'}
          </h2>
          <p className="text-xs text-slate-500">
            {step === 'input' 
              ? 'Login or create an account using 1-Click OTP Verification' 
              : `Enter the 6-digit code sent to ${identifier}`}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-2xl font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: SELECT TYPE & ENTER IDENTIFIER */}
        {step === 'input' && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            
            {/* Type Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setOtpType('mobile');
                  setIdentifier('');
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  otpType === 'mobile'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone size={16} /> Mobile Number
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpType('email');
                  setIdentifier('');
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  otpType === 'email'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail size={16} /> Email Address
              </button>
            </div>

            {/* Input Field */}
            {otpType === 'mobile' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-slate-600 border-r border-slate-200 pr-2">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98765 43210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-4 py-3 text-xs font-bold tracking-wider text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Dispatching OTP...
                </>
              ) : (
                <>
                  <KeyRound size={16} /> Send 6-Digit OTP Code
                </>
              )}
            </button>

          </form>
        )}

        {/* STEP 2: ENTER & AUTO-VERIFY 6-DIGIT OTP */}
        {step === 'otp' && (
          <div className="space-y-6">

            {devOtpCode && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between">
                <span>OTP Code: <strong className="text-emerald-700 tracking-widest font-black text-sm">{devOtpCode}</strong></span>
                <span className="text-[10px] uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-extrabold">Active</span>
              </div>
            )}

            {isSuccess ? (
              <div className="py-8 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 animate-bounce" />
                <h3 className="font-black text-slate-900 text-lg">OTP Verified!</h3>
                <p className="text-xs text-slate-500">Logining into your account...</p>
              </div>
            ) : (
              <>
                {/* 6 Auto-Focused Digit Input Boxes */}
                <div className="flex items-center justify-between gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={digitRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-emerald-600 focus:bg-white focus:outline-none transition shadow-sm"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    onClick={() => {
                      setStep('input');
                      setErrorMsg('');
                    }}
                    className="text-slate-500 hover:text-slate-800 font-bold"
                  >
                    ← Change {otpType === 'mobile' ? 'Mobile' : 'Email'}
                  </button>

                  <button
                    onClick={() => handleSendOtp()}
                    disabled={!canResend || isLoading}
                    className={`font-bold flex items-center gap-1.5 ${
                      canResend ? 'text-emerald-700 hover:underline' : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                    {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
                  </button>
                </div>

                <button
                  onClick={() => handleVerifyOtp()}
                  disabled={isLoading || otpDigits.some(d => d === '')}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Sign In'}
                </button>
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
