export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
      <p className="text-gray-500 mb-8">Last Updated: August 22, 2025</p>
      <section className="space-y-6 text-base text-gray-800">
        <div>
          <h2 className="font-semibold text-lg mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using TekPulse, you agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these Terms, you should not access or use the platform.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-2">2. Eligibility</h2>
          <p>
            TekPulse is exclusively for students. By registering, you confirm that you are currently enrolled in an educational institution and all information provided, including your name, student email, and student ID, is accurate.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-2">3. Data Collection</h2>
          <p>
            When you sign up and use TekPulse, we collect the following information:
          </p>
          <ul className="list-disc pl-6">
            <li><b>Full Name:</b> To personalize your experience and verify your identity.</li>
            <li><b>Student Email:</b> For account creation, login, and communication regarding platform updates.</li>
            <li><b>Student ID:</b> To ensure only eligible students have access.</li>
            <li><b>Password:</b> Secured and encrypted for your protection.</li>
          </ul>
          <p>
            Additional data may be collected as you use the platform, such as posts, comments, likes, and messages.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-2">4. Use of Information</h2>
          <p>
            Your information is used to:
          </p>
          <ul className="list-disc pl-6">
            <li>Provide and maintain your account.</li>
            <li>Facilitate connections and interactions with other students.</li>
            <li>Improve our services and user experience.</li>
            <li>Communicate with you regarding updates, changes, or issues related to your account.</li>
          </ul>
          <p>
            We do not sell your personal information to third parties. Some data may be shared with trusted service providers as necessary for platform operation (e.g., authentication, hosting).
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-2">5. User Responsibilities</h2>
          <ul className="list-disc pl-6">
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You agree not to share your account or allow anyone else to use it.</li>
            <li>You agree to use TekPulse in a respectful and lawful manner.</li>
            <li>Inappropriate, harmful, or illegal content is strictly prohibited.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-2">6. Content</h2>
          <p>
            You retain ownership of the content you post, but you grant TekPulse a non-exclusive license to display and share your content within the platform.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-2">7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account if you violate these Terms or engage in harmful activities.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-2">8. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of significant changes. Continued use of the platform after changes constitutes your acceptance of the new Terms.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-2">9. Contact</h2>
          <p>
            For questions or concerns regarding these Terms, please contact us at <a href="mailto:support@tekpulse.com" className="text-[#2B7A78] underline">support@tekpulse.com</a>.
          </p>
        </div>
      </section>
      <div className="mt-12 text-sm text-gray-500">
        By clicking &quot; I agree&quot; and using TekPulse, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
      </div>
    </div>
  );
}
