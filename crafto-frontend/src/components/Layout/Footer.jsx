import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

const Footer = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: t('footer.links.about'), href: '/about' },
      { name: t('footer.links.careers'), href: '#' },
      { name: t('footer.links.press'), href: '#' },
      { name: t('footer.links.blog'), href: '#' },
    ],
    marketplace: [
      { name: t('footer.links.explore'), href: '/explore' },
      { name: t('footer.links.artists'), href: '#' },
      { name: t('footer.links.collections'), href: '#' },
      { name: t('footer.links.auctions'), href: '#' },
    ],
    support: [
      { name: t('footer.links.help'), href: '#' },
      { name: t('footer.links.contact'), href: '#' },
      { name: t('footer.links.privacy'), href: '#' },
      { name: t('footer.links.terms'), href: '#' },
    ],
    community: [
      { name: t('footer.links.join'), href: '/community' },
      { name: t('footer.links.live'), href: '#' },
      { name: t('footer.links.courses'), href: '/learn' },
      { name: t('footer.links.events'), href: '#' },
    ]
  }

  const socialLinks = [
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
  ]

  return (
    <footer className="bg-base-200 border-t border-base-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-serif font-bold text-gradient">Crafto</span>
            </Link>
            <p className="text-base-content/70 mb-6 max-w-md">
              {t('footer.desc')}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-base-content/70">
                <Mail className="w-4 h-4" />
                <span>ajitkoli302@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-base-content/70">
                <Phone className="w-4 h-4" />
                <span>78521463551</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-base-content/70">
                <MapPin className="w-4 h-4" />
                <span>karnataka,India</span>
              </div>
            </div>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="font-semibold text-base-content mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-base-content/70 hover:text-primary-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Marketplace Section */}
          <div>
            <h3 className="font-semibold text-base-content mb-4">{t('footer.marketplace')}</h3>
            <ul className="space-y-2">
              {footerLinks.marketplace.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-base-content/70 hover:text-primary-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="font-semibold text-base-content mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-base-content/70 hover:text-primary-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Section */}
          <div>
            <h3 className="font-semibold text-base-content mb-4">{t('footer.community')}</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-base-content/70 hover:text-primary-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-base-300 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-base-content/70">
              {t('footer.rights', { year: currentYear })}
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-base-300 hover:bg-base-400 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
