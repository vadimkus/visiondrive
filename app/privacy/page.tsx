import Section from '../components/common/Section'

export default function PrivacyPage() {
  return (
    <>
      <div className="pt-24 sm:pt-28 md:pt-32">
        <Section className="pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Vision Drive Technologies FZ-LLC ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                use our smart parking services, mobile application, and website (collectively, the "Service").
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                By using our Service, you agree to the collection and use of information in accordance with this policy. 
                If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect personal information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Name and contact information (email address, phone number)</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
                <li>Account credentials and profile information</li>
                <li>Vehicle information (license plate, vehicle type)</li>
                <li>Parking preferences and reservation history</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Usage Data</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We automatically collect certain information when you use our Service:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Device information (device type, operating system, unique device identifiers)</li>
                <li>Location data (GPS coordinates, parking location usage)</li>
                <li>Usage patterns (app interactions, feature usage, session duration)</li>
                <li>Log data (IP address, browser type, access times, pages viewed)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Parking Data</h3>
              <p className="text-gray-700 leading-relaxed">
                Our sensors and gateways collect anonymized parking occupancy data, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                <li>Parking space availability and occupancy status</li>
                <li>Parking duration and turnover rates</li>
                <li>Traffic flow patterns (anonymized and aggregated)</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>To provide, maintain, and improve our Service</li>
                <li>To process transactions and manage your account</li>
                <li>To send you service-related notifications and updates</li>
                <li>To personalize your experience and provide location-based services</li>
                <li>To analyze usage patterns and improve our technology</li>
                <li>To detect, prevent, and address technical issues and security threats</li>
                <li>To comply with legal obligations and enforce our terms</li>
                <li>To provide aggregated analytics to business partners (anonymized data only)</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Service Providers</h3>
              <p className="text-gray-700 leading-relaxed">
                We may share information with third-party service providers who perform services on our behalf, 
                such as payment processing, data analytics, cloud storage, and customer support.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Business Partners</h3>
              <p className="text-gray-700 leading-relaxed">
                We may share anonymized, aggregated parking data with municipalities, property managers, and 
                business partners for urban planning, traffic optimization, and business intelligence purposes. 
                This data does not identify individual users.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed">
                We may disclose information if required by law, court order, or government regulation, or to 
                protect our rights, property, or safety, or that of our users or others.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                to the acquiring entity.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction. These measures 
                include encryption, secure data transmission, access controls, and regular security assessments. 
                However, no method of transmission over the internet or electronic storage is 100% secure, and 
                we cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, please contact us using the information provided in the Contact section below.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our Service and store 
                certain information. You can instruct your browser to refuse all cookies or to indicate when 
                a cookie is being sent. However, if you do not accept cookies, you may not be able to use 
                some portions of our Service.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined 
                in this Privacy Policy, unless a longer retention period is required or permitted by law. When 
                we no longer need your information, we will securely delete or anonymize it.
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and maintained on computers located outside of your 
                state, province, country, or other governmental jurisdiction where data protection laws may 
                differ. By using our Service, you consent to the transfer of your information to facilities 
                outside your jurisdiction.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children. If you become aware that a child has provided us with 
                personal information, please contact us immediately.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date. You are 
                advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-2">
                  <strong>Vision Drive Technologies FZ-LLC</strong>
                </p>
                <p className="text-gray-700 mb-2">
                  Email: <a href="mailto:privacy@visiondrive.ae" className="text-primary-600 hover:underline">privacy@visiondrive.ae</a>
                </p>
                <p className="text-gray-700 mb-2">
                  General: <a href="mailto:ask@visiondrive.ae" className="text-primary-600 hover:underline">ask@visiondrive.ae</a>
                </p>
                <p className="text-gray-700 mb-2">
                  Phone: <a href="tel:+971559152985" className="text-primary-600 hover:underline">+971 55 915 2985</a>
                </p>
                <div className="text-gray-700">
                  <div>Office: VisionDrive, Ground floor</div>
                  <div>RAKEZ Compass Coworking Centre</div>
                  <div>Ras Al Khaimah, UAE</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </Section>
      </div>
    </>
  )
}

