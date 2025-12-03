import Section from '@/components/common/Section'

export default function TermsPage() {
  return (
    <>
      <Section className="pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </Section>

      <Section background="gray">
        <div className="max-w-4xl mx-auto prose prose-sm max-w-none">
          <div className="bg-white rounded-lg p-8 shadow-sm space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service ("Terms") govern your access to and use of the smart parking services, 
                mobile application, and website (collectively, the "Service") provided by Vision Drive Technologies 
                FZ-LLC ("we," "our," or "us").
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any 
                part of these Terms, you may not access or use the Service.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Eligibility</h2>
              <p className="text-gray-700 leading-relaxed">
                You must be at least 18 years old to use our Service. By using the Service, you represent and warrant 
                that you are of legal age to form a binding contract and meet all eligibility requirements. If you are 
                using the Service on behalf of an organization, you represent that you have authority to bind that 
                organization to these Terms.
              </p>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Registration</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use certain features of our Service, you must register for an account. When you register, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent 
                or illegal activity.
              </p>
            </section>

            {/* Use of Service */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Use of Service</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Permitted Use</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may use our Service for lawful purposes only and in accordance with these Terms. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Use the Service only for personal or authorized business purposes</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect the rights of other users and third parties</li>
                <li>Follow all parking regulations and posted signs</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Prohibited Activities</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Transmit harmful code, viruses, or malicious software</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without authorization</li>
                <li>Impersonate others or provide false information</li>
                <li>Resell or redistribute the Service without permission</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            {/* Parking Reservations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Parking Reservations and Payments</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Reservations</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you make a parking reservation through our Service:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>You are reserving a parking space for the specified time period</li>
                <li>You must arrive and park within the reserved time window</li>
                <li>You are responsible for complying with all parking regulations</li>
                <li>Reservations are subject to availability</li>
                <li>We reserve the right to cancel reservations due to technical issues or safety concerns</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Payments</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Payment terms:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>All fees are displayed before you confirm your reservation</li>
                <li>Payment is processed securely through third-party payment processors</li>
                <li>You authorize us to charge your payment method for all fees</li>
                <li>Refunds are subject to our refund policy and applicable laws</li>
                <li>Prices may vary based on location, time, and demand</li>
                <li>We reserve the right to change pricing with reasonable notice</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Cancellations and Refunds</h3>
              <p className="text-gray-700 leading-relaxed">
                Cancellation and refund policies vary by location and reservation type. Please review the specific 
                terms displayed at the time of booking. Generally, cancellations made within a reasonable time 
                before the reservation start time may be eligible for a refund, subject to our refund policy.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service and its original content, features, and functionality are owned by Vision Drive 
                Technologies FZ-LLC and are protected by international copyright, trademark, patent, trade secret, 
                and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any 
                part of our Service without our prior written consent.
              </p>
            </section>

            {/* User Content */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Content</h2>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of any content you submit through the Service ("User Content"). By submitting 
                User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, 
                and distribute your User Content for the purpose of providing and improving our Service. You represent 
                that you have the right to grant this license and that your User Content does not violate any third-party 
                rights.
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
                OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT 
                LIMITED TO:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
                <li>Accuracy, reliability, or availability of the Service</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Security of data transmission or storage</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                We do not guarantee that parking spaces will always be available or that our sensors will always 
                accurately detect occupancy. Parking availability is subject to real-time conditions and may change 
                without notice.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Loss of profits, revenue, data, or use</li>
                <li>Business interruption or loss of business opportunities</li>
                <li>Personal injury or property damage</li>
                <li>Parking violations, fines, or towing charges</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Our total liability for any claims arising from or related to the Service shall not exceed the 
                amount you paid us in the twelve (12) months preceding the claim.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Vision Drive Technologies FZ-LLC, its officers, 
                directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, 
                or expenses (including reasonable attorneys' fees) arising from your use of the Service, violation 
                of these Terms, or infringement of any rights of another party.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for any reason, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of fees</li>
                <li>Extended periods of inactivity</li>
                <li>At our sole discretion</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Upon termination, your right to use the Service will cease immediately. You may terminate your 
                account at any time by contacting us or using the account deletion feature in the app.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law and Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates, 
                without regard to its conflict of law provisions.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Any disputes arising from or relating to these Terms or the Service shall be resolved through good 
                faith negotiations. If negotiations fail, disputes shall be subject to the exclusive jurisdiction 
                of the courts of Dubai, United Arab Emirates.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will 
                provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change 
                will be determined at our sole discretion. Your continued use of the Service after any changes constitutes 
                acceptance of the new Terms.
              </p>
            </section>

            {/* Severability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Severability</h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited 
                or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            {/* Entire Agreement */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Entire Agreement</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Vision Drive 
                Technologies FZ-LLC regarding the Service and supersede all prior agreements and understandings.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-2">
                  <strong>Vision Drive Technologies FZ-LLC</strong>
                </p>
                <p className="text-gray-700 mb-2">
                  Email: <a href="mailto:legal@visiondrive.ae" className="text-primary-600 hover:underline">legal@visiondrive.ae</a>
                </p>
                <p className="text-gray-700 mb-2">
                  General: <a href="mailto:info@visiondrive.ae" className="text-primary-600 hover:underline">info@visiondrive.ae</a>
                </p>
                <p className="text-gray-700">
                  Address: Dubai, United Arab Emirates
                </p>
              </div>
            </section>
          </div>
        </div>
      </Section>
    </>
  )
}

