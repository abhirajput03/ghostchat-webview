import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { sendOtp, verifyOtp, deleteAccount } from '../api/accountService';
import { setAuthToken } from '../api/apiClient';

function DeleteAccount() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmText, setConfirmText] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const targetText = t('deleteAccount.steps.step4.targetText');

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Step 1: Initial Warning Screen
  // Step 2: Phone Number Input
  // Step 3: OTP Verification
  // Step 4: Final Confirmation (Checkbox + Typing)

  const isTargetTextConfirmed = confirmText === targetText && isChecked;

  const resetEverything = () => {
    setStep(1);
    setPhone('');
    setDialCode('+91');
    setSessionId('');
    setOtp(['', '', '', '', '', '']);
    setConfirmText('');
    setIsChecked(false);
    setError('');
    setAuthToken(null);
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      // Extract mobile number without dial code for backend
      const rawMobile = phone.replace(dialCode, '').replace(/\D/g, '');
      const response = await sendOtp({
        mobile: rawMobile,
        country_code: dialCode,
        is_coach: false
      });
      console.log('Send OTP Response:', response);
      const sid = response?.session_id || response?.data?.session_id;
      if (sid) {
        setSessionId(sid);
      }
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      // Extract mobile number without dial code for backend
      const rawMobile = phone.replace(dialCode, '').replace(/\D/g, '');
      const response = await sendOtp({
        mobile: rawMobile,
        country_code: dialCode,
        is_coach: false
      });
      console.log('Resend OTP Response:', response);
      const sid = response?.session_id || response?.data?.session_id;
      if (sid) {
        setSessionId(sid);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const otpString = otp.join('');
      const data = await verifyOtp({
        session_id: sessionId,
        otp: otpString
      });
      console.log('Verify OTP Response:', data);

      const accessToken = data?.access_token || data?.data?.access_token

      if (accessToken) {
        setAuthToken(accessToken);
        setStep(4);
        setError('');
      } else {
        // If the API returns 2xx but no token, treat it as an error ONLY if there's an error message
        const msg = data?.message || data?.data?.message || t('deleteAccount.errors.failed');
        setError(msg);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await deleteAccount();
      console.log('Delete Account Response:', response);

      resetEverything();

      // On success, notify Flutter app via postMessage
      if (window.flutter_inappwebview) {
        window.flutter_inappwebview.callHandler('accountDeleted');
      } else {
        window.parent?.postMessage({ type: 'accountDeleted' }, '*');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Warning Icon */}
            <div className="text-center mb-8 relative">
              <div className="mx-auto w-20 h-20 relative mb-6">
                <div className="absolute inset-2 bg-red-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center border border-red-100 shadow-sm z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-9 h-9 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2.5">
                {t('deleteAccount.header.warning')}
              </h1>
              <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                {t('deleteAccount.header.description')}
              </p>
            </div>

            {/* What will be deleted List */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:bg-linear-to-b before:from-transparent before:via-transparent before:to-white/60 before:z-0 mb-8">
              <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">{t('deleteAccount.whatDeleted.title')}</h3>

              <ul className="space-y-5 relative z-10">
                <li className="flex gap-4 items-center group">
                  <div className="w-11 h-11 rounded-2xl bg-red-50/50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-red-50 group-hover:border-red-100 group-hover:shadow-[0_4px_12px_rgba(239,68,68,0.1)] transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5.5 h-5.5 text-red-500 opacity-80 group-hover:opacity-100 transition-opacity">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px] text-slate-900">{t('deleteAccount.whatDeleted.profile.title')}</h4>
                    <p className="text-[13.5px] text-slate-500 mt-0.5 leading-relaxed">{t('deleteAccount.whatDeleted.profile.description')}</p>
                  </div>
                </li>

                <li className="flex gap-4 items-center group">
                  <div className="w-11 h-11 rounded-2xl bg-red-50/50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-red-50 group-hover:border-red-100 group-hover:shadow-[0_4px_12px_rgba(239,68,68,0.1)] transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5.5 h-5.5 text-red-500 opacity-80 group-hover:opacity-100 transition-opacity">
                      <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px] text-slate-900">{t('deleteAccount.whatDeleted.chat.title')}</h4>
                    <p className="text-[13.5px] text-slate-500 mt-0.5 leading-relaxed">{t('deleteAccount.whatDeleted.chat.description')}</p>
                  </div>
                </li>

                <li className="flex gap-4 items-center group">
                  <div className="w-11 h-11 rounded-2xl bg-red-50/50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-red-50 group-hover:border-red-100 group-hover:shadow-[0_4px_12px_rgba(239,68,68,0.1)] transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500 opacity-80 group-hover:opacity-100 transition-opacity">
                      <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px] text-slate-900">{t('deleteAccount.whatDeleted.call.title')}</h4>
                    <p className="text-[13.5px] text-slate-500 mt-0.5 leading-relaxed">{t('deleteAccount.whatDeleted.call.description')}</p>
                  </div>
                </li>

                <li className="flex gap-4 items-center group">
                  <div className="w-11 h-11 rounded-2xl bg-red-50/50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-red-50 group-hover:border-red-100 group-hover:shadow-[0_4px_12px_rgba(239,68,68,0.1)] transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5.5 h-5.5 text-red-500 opacity-80 group-hover:opacity-100 transition-opacity">
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px] text-slate-900">{t('deleteAccount.whatDeleted.media.title')}</h4>
                    <p className="text-[13.5px] text-slate-500 mt-0.5 leading-relaxed">{t('deleteAccount.whatDeleted.media.description')}</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Alternatives Box */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-[1.25rem] p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5.5 h-5.5 text-slate-800">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <h3 className="font-bold text-[16px] text-slate-800">{t('deleteAccount.alternatives.title')}</h3>
              </div>
              <ul className="space-y-3.5 pl-0.5">
                <li className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                  <span className="text-[14.5px] text-slate-600 font-medium">{t('deleteAccount.alternatives.item1')}</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                  <span className="text-[14.5px] text-slate-600 font-medium">{t('deleteAccount.alternatives.item2')}</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                  <span className="text-[14.5px] text-slate-600 font-medium">{t('deleteAccount.alternatives.item3')}</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 min-h-115 flex flex-col justify-center">
            <button
              onClick={() => {
                setStep(1);
                setError('');
              }}
              className="absolute top-6 left-6 p-2 -ml-2 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>

            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-primary-500/10 text-[#2196F3] flex items-center justify-center rounded-2xl mb-6 shadow-sm border border-primary-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2.5">
                {t('deleteAccount.steps.step2.title')}
              </h2>
              <p className="text-[15px] text-slate-500 leading-relaxed font-medium px-4">
                {t('deleteAccount.steps.step2.description')}
              </p>
            </div>

            <div className="max-w-xs mx-auto w-full phone-input-container">
              <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-2">{t('deleteAccount.steps.step2.label')}</label>
              <PhoneInput
                defaultCountry="in"
                value={phone}
                forceDialCode={true}
                onChange={(phone, meta) => {
                  setPhone(phone);
                  setDialCode(`+${meta.country.dialCode}`);
                  setError('');
                }}
                inputClassName="!w-full !h-auto !py-3.5 !px-4 !bg-white !border !border-slate-300 !rounded-xl !text-slate-900 !placeholder-slate-400 !focus:outline-none !focus:border-[#2196F3] !focus:shadow-[0_0_0_4px_rgba(33,150,243,0.15)] !transition-all !font-sans !text-[15px] !font-medium !tracking-wide"
                containerClassName="!w-full"
                countrySelectorStyleProps={{
                  buttonClassName: "!h-auto !py-3.5 !px-3 !bg-white !border !border-slate-300 !rounded-xl !mr-2 !shadow-sm !hover:bg-slate-50 !transition-colors !min-w-[70px]",
                  flagClassName: "!w-6 !h-auto",
                }}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 min-h-115 flex flex-col justify-center">
            <button
              onClick={() => {
                setStep(2);
                setError('');
              }}
              className="absolute top-6 left-6 p-2 -ml-2 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>

            <div className="text-center mb-10">
              <div className="mx-auto w-16 h-16 bg-primary-500/10 text-[#2196F3] flex items-center justify-center rounded-2xl mb-6 shadow-sm border border-[#2196F3]/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2.5">
                {t('deleteAccount.steps.step3.title')}
              </h2>
              <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                {t('deleteAccount.steps.step3.description', { phone: `${dialCode} ${phone.replace(dialCode, '').trim()}` })}
              </p>
            </div>

            <div className="flex justify-center gap-2 sm:gap-3 px-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-white border border-slate-300 rounded-lg sm:rounded-xl text-slate-900 focus:outline-none focus:border-[#2196F3] focus:ring-4 focus:ring-[#2196F3]/15 transition-all shadow-sm"
                />
              ))}
            </div>

            <div className="text-center mt-8 flex flex-col items-center gap-2">
              <button
                onClick={handleResendOtp}
                disabled={loading}
                className="text-sm font-semibold text-[#2196F3] hover:text-[#1976D2] transition-colors disabled:opacity-50"
              >
                {t('deleteAccount.steps.step3.resend')}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <button
              onClick={() => {
                setStep(3);
                setError('');
              }}
              className="absolute top-6 left-6 p-2 -ml-2 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>

            <div className="text-center mb-8 mt-4">
              <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 flex items-center justify-center rounded-2xl mb-6 shadow-sm border border-red-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2.5">
                {t('deleteAccount.steps.step4.title')}
              </h2>
              <p className="text-[15px] text-slate-500 leading-relaxed font-medium px-4">
                {t('deleteAccount.steps.step4.description')}
              </p>
            </div>

            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-start gap-4 mb-8">
                <div className="relative flex items-center pt-1 shrink-0">
                  <input
                    type="checkbox"
                    id="confirm-terms"
                    checked={isChecked}
                    onChange={(e) => {
                      setIsChecked(e.target.checked);
                      if (!e.target.checked) setConfirmText('');
                    }}
                    className="peer appearance-none w-5.5 h-5.5 bg-white border border-slate-300 rounded-md hover:border-slate-400 checked:bg-[#2196F3] checked:border-[#2196F3] cursor-pointer transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#2196F3]/20 shadow-sm"
                  />
                  <svg className="absolute w-3.5 h-3.5 text-white left-1 pointer-events-none opacity-0 scale-50 peer-checked:scale-100 peer-checked:opacity-100 transition-all duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <label htmlFor="confirm-terms" className="text-[14px] font-medium text-slate-600 leading-relaxed cursor-pointer select-none -mt-0.5">
                  {t('deleteAccount.steps.step4.checkboxPart1')}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#2196F3] font-bold hover:text-[#1976D2] hover:underline underline-offset-2 transition-all">{t('deleteAccount.steps.step4.terms')}</a>
                  {t('deleteAccount.steps.step4.and')}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#2196F3] font-bold hover:text-[#1976D2] hover:underline underline-offset-2 transition-all">{t('deleteAccount.steps.step4.privacy')}</a>
                  {t('deleteAccount.steps.step4.checkboxPart2')}
                </label>
              </div>

              <div className={`
                transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
                ${isChecked ? 'max-h-[240px] opacity-100' : 'max-h-0 opacity-0'}
              `}>
                <div className="pt-2">
                  <p className="block text-[14px] font-semibold text-slate-700 mb-3">
                    {t('deleteAccount.steps.step4.typeToConfirm')}{' '}
                    <span className="inline-block text-red-600 font-bold bg-white px-2.5 py-1 rounded border border-red-200/60 shadow-sm ml-1 select-all translate-y-px">{targetText}</span>
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      id="confirm"
                      value={confirmText}
                      onChange={(e) => {
                        setConfirmText(e.target.value);
                        setError('');
                      }}
                      onPaste={(e) => e.preventDefault()}
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                      placeholder={t('deleteAccount.steps.step4.targetText')}
                      className="w-full px-4 pt-3.5 pb-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2196F3] focus:ring-4 focus:ring-[#2196F3]/15 transition-all font-sans text-[15px] shadow-sm font-medium"
                      autoComplete="off"
                    />
                    {confirmText && confirmText !== targetText && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                    {confirmText === targetText && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2196F3]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const getActionButtons = () => {
    switch (step) {
      case 1:
        return (
          <>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-[18px] text-[15.5px] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] transform hover:-translate-y-0.5 cursor-pointer"
            >
              {t('deleteAccount.buttons.continue')}
            </button>
            <button
              type="button"
              onClick={resetEverything}
              className="w-full py-[18px] text-[15.5px] font-bold text-slate-700 hover:text-slate-900 transition-all duration-200 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
            >
              {t('deleteAccount.buttons.keep')}
            </button>
          </>
        );
      case 2:
        return (
          <button
            type="button"
            disabled={phone.length < 10 || loading}
            onClick={handleSendOtp}
            className={`
              w-full py-[18px] text-[15.5px] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2
              ${phone.length >= 10 && !loading
                ? 'bg-[#2196F3] text-white hover:bg-[#1e88e5] shadow-[0_8px_20px_-6px_rgba(33,150,243,0.5)] transform hover:-translate-y-0.5 cursor-pointer'
                : 'bg-slate-200/70 text-slate-400 cursor-not-allowed border border-slate-200'}
            `}
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> {t('deleteAccount.steps.step2.sending')}</>
            ) : t('deleteAccount.steps.step2.button')}
          </button>
        );
      case 3:
        const isOtpComplete = otp.every(d => d !== '');
        return (
          <button
            type="button"
            disabled={!isOtpComplete || loading}
            onClick={handleVerifyOtp}
            className={`
              w-full py-[18px] text-[15.5px] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2
              ${isOtpComplete && !loading
                ? 'bg-[#2196F3] text-white hover:bg-[#1e88e5] shadow-[0_8px_20px_-6px_rgba(33,150,243,0.5)] transform hover:-translate-y-0.5 cursor-pointer'
                : 'bg-slate-200/70 text-slate-400 cursor-not-allowed border border-slate-200'}
            `}
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> {t('deleteAccount.steps.step3.verifying')}</>
            ) : t('deleteAccount.steps.step3.button')}
          </button>
        );
      case 4:
        return (
          <>
            {error && (
              <p className="text-[13px] text-red-500 font-medium text-center -mt-1 mb-1">{error}</p>
            )}
            <button
              type="button"
              disabled={!isTargetTextConfirmed || loading}
              onClick={handleDeleteAccount}
              className={`
                w-full py-4.5 text-[15.5px] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2
                ${isTargetTextConfirmed && !loading
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)] transform hover:-translate-y-0.5 cursor-pointer'
                  : 'bg-slate-200/70 text-slate-400 cursor-not-allowed border border-slate-200'}
              `}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> {t('deleteAccount.steps.step4.deleting')}</>
              ) : t('deleteAccount.steps.step4.button')}
            </button>
            <button
              type="button"
              onClick={resetEverything}
              className="w-full py-4.5 text-[15.5px] font-bold text-slate-700 hover:text-slate-900 transition-all duration-200 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
            >
              {t('deleteAccount.buttons.cancel')}
            </button>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 font-sans flex items-center justify-center p-0 sm:p-8 selection:bg-primary-500/20 selection:text-slate-900 overflow-hidden">

      {/* Background Soft Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>

      {/* Main Container - App Like Layout */}
      <div className="max-w-110 w-full h-full sm:max-h-205 bg-white sm:rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border-0 sm:border sm:border-slate-100 relative z-10 flex flex-col overflow-hidden">

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200/60 flex shrink-0">
          <div
            className="h-full bg-[#2196F3] transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        {/* Scrollable Dynamic Content Area */}
        <div className="p-6 sm:px-10 pb-4 relative overflow-y-auto flex-1 no-scrollbar">
          {error && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                <p className="text-[13.5px] text-red-700 font-semibold leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={() => setError('')}
                  className="ml-auto text-red-400 hover:text-red-600 transition-colors p-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {renderStepContent()}
        </div>

        {/* Fixed Action Buttons at the Bottom */}
        <div className="px-6 py-5 bg-white border-t border-slate-100 flex flex-col gap-3 shrink-0 z-10">
          {getActionButtons()}
        </div>

      </div>
    </div>
  );
}

export default DeleteAccount;
