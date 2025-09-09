"use client";

import ContentLayout from "@/components/layout/ContentLayout";
import { useAppSession } from "@/hooks/useAppSession";
import { MyReservations } from "./MyReservations";
import { FindReservationForm } from "./FindReservationForm";
import { LoginPageLink } from "./LoginPageLink";
import { Skeleton } from "@/components/ui/skeleton";

const MyPage = () => {
  const { session, status } = useAppSession();
  const isLoading = status === "loading";

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="p-4 md:p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-48 w-full" />
        </div>
      </ContentLayout>
    );
  }

  const isCustomer = session?.user?.role === "customer";

  return (
    <ContentLayout>
      <div className="p-4 md:p-6">
        {isCustomer ? (
          <MyReservations />
        ) : (
          <>
            <LoginPageLink />
            <FindReservationForm />
          </>
        )}
      </div>
    </ContentLayout>
  );
};

export default MyPage;
