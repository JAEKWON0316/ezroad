import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    서비스: [
      { href: '/restaurants', label: '맛집 찾기' },
      { href: '/reviews', label: '리뷰' },
      { href: '/map', label: '지도' },
    ],
    고객지원: [
      { href: '/faq', label: '자주 묻는 질문' },
      { href: '/notice', label: '공지사항' },
      { href: '/contact', label: '문의하기' },
    ],
    정책: [
      { href: '/terms', label: '이용약관' },
      { href: '/privacy', label: '개인정보처리방침' },
      { href: '/business-terms', label: '사업자 약관' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍽️</span>
              <span className="text-xl font-bold text-white">EzenRoad</span>
            </Link>
            <p className="text-sm mb-4">
              EzenRoad는 맛집 탐색과 예약을 손쉽게 할 수 있는 플랫폼입니다.
              다양한 맛집 정보와 생생한 리뷰를 확인해보세요.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>서울특별시 강남구 테헤란로 123</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>02-1234-5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@ezenroad.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>평일 09:00 - 18:00</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-orange-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} EzenRoad. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                사업자등록번호: 123-45-67890
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
