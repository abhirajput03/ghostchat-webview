import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.png';

function Terms() {
  const { t } = useTranslation();
  const sections = t('terms.sections', { returnObjects: true });

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#2196F3]/20">

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 border-b border-slate-200/80 backdrop-blur-md bg-white/90 shadow-[0_1px_12px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <img src={logo} alt="Ghost Chat Logo" className="w-11 h-11 rounded-2xl object-cover" />
          <div>
            <h1 className="text-[17px] font-extrabold text-slate-900 leading-none tracking-tight">
              {t('terms.header.title')}
            </h1>
            <p className="text-[13px] text-slate-400 font-medium mt-1">
              {t('terms.header.effectiveDate')} <span className="text-[#2196F3] font-semibold">{t('terms.header.date')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Hero Intro Card */}
        <div className="bg-gradient-to-br from-[#2196F3]/10 to-[#2196F3]/5 border border-[#2196F3]/20 rounded-3xl p-7 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-[#2196F3] rounded-xl flex items-center justify-center shadow-md shadow-[#2196F3]/30 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <h2 className="text-[16px] font-bold text-[#1565C0]">
              {t('terms.hero.title')}
            </h2>
          </div>
          <p className="text-[15px] text-slate-600 leading-relaxed mb-4">
            {t('terms.hero.p1')}
          </p>
          <p className="text-[15px] text-slate-600 leading-relaxed mb-4">
            {t('terms.hero.p2')}
          </p>
          <p className="text-[15px] font-semibold text-slate-700 leading-relaxed">
            {t('terms.hero.p3')}
          </p>
        </div>

        {/* Sections Grid */}
        <div className="space-y-4">
          {sections.map((section, i) => (
            <div
              key={i}
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#2196F3]/30 transition-all duration-300"
            >
              {/* Section Title Bar */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50 group-hover:bg-[#2196F3]/5 transition-colors duration-200">
                <span className="text-xl">{section.icon}</span>
                <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">{section.title}</h2>
              </div>

              {/* Section Body */}
              <div className="px-6 py-4">
                {section.intro && (
                  <p className="text-[14.5px] font-semibold text-slate-700 mb-3">{section.intro}</p>
                )}

                {section.paragraphs?.map((p, j) => (
                  <p key={j} className="text-[14.5px] text-slate-600 leading-relaxed mb-3 last:mb-0">{p}</p>
                ))}

                {section.items && (
                  <ul className="space-y-2 mt-3">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-[14.5px] text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2196F3] mt-[7px] shrink-0"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.footer && (
                  <p className="text-[14.5px] text-slate-600 leading-relaxed mt-4 pt-4 border-t border-slate-100">{section.footer}</p>
                )}

                {section.contact && (
                  <div className="mt-4 pt-3">
                    <span className="text-[14.5px] font-semibold text-slate-700">Email: </span>
                    <a href={`mailto:${section.contact}`} className="text-[#2196F3] font-semibold hover:underline underline-offset-2 text-[14.5px]">
                      {section.contact}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white mt-10">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2196F3] to-[#1565C0] rounded-xl flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <span className="text-[14px] font-bold text-slate-700">{t('common.brandName', 'Ghost Chat')}</span>
          </div>
          <p className="text-[13px] text-slate-400 font-medium">
            {t('terms.footer.rights')}
          </p>
        </div>
      </div>

    </div>
  );
}

export default Terms;
