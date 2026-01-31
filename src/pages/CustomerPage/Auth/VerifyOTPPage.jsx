import AuthLayout from "../../../components/auth/authLayout";
import AuthFormWrapper from "../../../components/auth/AuthFormWrapper";
import VerifyOTPForm from "./VerifyOTPForm";

const VerifyOTPPage = () => {
  return (
    <AuthLayout>
      <AuthFormWrapper
        title="Verification"
        subtitle="Enter verification code"
        linkText=""
        linkTo=""
      >
        <VerifyOTPForm />
      </AuthFormWrapper>
    </AuthLayout>
  );
};

export default VerifyOTPPage;
