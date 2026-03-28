import { GraduationCap, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <GraduationCap className="w-6 h-6" />
              Kidzee Polichalur
            </div>
            <p className="text-white/80 text-sm">
              Nurturing young minds with love, creativity, and joy. Your child&apos;s first step to a bright future.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/activities" className="hover:text-white transition-colors">Activities</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3">Contact Us</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Kidzee Polichalur</li>
              <li>Polichalur, Tamil Nadu</li>
              <li>India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-white/60">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-300 fill-red-300" /> for Kidzee Polichalur
          </p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Kidzee Polichalur. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
