import { ContributeForm } from "@/components/ContributeForm";

export function Group() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Xitique Group</h1>
            <p className="text-gray-600 mt-2">
              Participate in your blockchain-powered savings group
            </p>
          </div>
          <ContributeForm />
        </div>
      </div>
    </div>
  );
}