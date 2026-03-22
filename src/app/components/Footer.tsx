import { Link } from 'react-router';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import logoImage from '../../assets/MojoDojoLogo.png';
import { useLanguage } from '../contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-brand-black border-t border-brand-dark-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="MojoDojo" className="h-10 w-10" />
              <span className="text-xl font-bold gold-accent">MojoDojo</span>
            </div>
            <p className="text-sm text-brand-light-gray elegant-text">
              {t.footer.tagline}
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/mojomojo.dojo/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-light-gray hover:text-brand-gold transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@mojodojo.com"
                className="text-brand-light-gray hover:text-brand-gold transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-brand-off-white mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-brand-light-gray hover:text-brand-gold transition-colors">
                  {t.footer.links.about}
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-sm text-brand-light-gray hover:text-brand-gold transition-colors">
                  {t.footer.links.reviews}
                </Link>
              </li>
              <li>
                <Link to="/order" className="text-sm text-brand-light-gray hover:text-brand-gold transition-colors">
                  {t.footer.links.order}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-brand-light-gray hover:text-brand-gold transition-colors">
                  {t.footer.links.faq}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-brand-off-white mb-4">{t.footer.support}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-sm text-brand-light-gray hover:text-brand-gold transition-colors">
                  {t.footer.links.faq}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-brand-light-gray hover:text-brand-gold transition-colors">
                  {t.footer.links.contact}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-brand-light-gray hover:text-brand-gold transition-colors">
                  {t.footer.links.privacy}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-brand-light-gray hover:text-brand-gold transition-colors">
                  {t.footer.links.terms}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-brand-off-white mb-4">{t.footer.getInTouch}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-brand-light-gray">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-gold" />
                <span>{t.footer.location}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-brand-light-gray">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-gold" />
                <a href="mailto:hello@mojodojo.com" className="hover:text-brand-gold transition-colors">
                  hello@mojodojo.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-brand-light-gray">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-gold" />
                <span>{t.footer.available}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="golden-divider my-8"></div>

        <div className="text-center text-sm text-brand-light-gray">
          <p>{t.footer.copyright(new Date().getFullYear())}</p>
        </div>
      </div>
    </footer>
  );
}
