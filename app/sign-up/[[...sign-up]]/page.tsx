import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-16 px-6 bg-cream">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🌿</span>
          <h1 className="font-serif tracking-tighter text-3xl text-espresso mt-3">Create your account</h1>
          <p className="text-espresso/60 font-sans mt-2 text-sm">Save your plans and access them anywhere</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white border border-rose/30 rounded-2xl shadow-sm font-sans",
              headerTitle: "font-serif tracking-tighter text-espresso",
              headerSubtitle: "text-espresso/60",
              formButtonPrimary:
                "bg-espresso hover:bg-espresso-light text-cream font-sans rounded-xl transition-all",
              formFieldInput:
                "border-rose/30 rounded-xl font-sans bg-white focus:ring-rose",
              footerActionLink: "text-sage hover:text-sage-dark",
            },
          }}
        />
      </div>
    </div>
  );
}
