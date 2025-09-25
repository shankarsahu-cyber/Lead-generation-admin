
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CreatePlanFormProps {
	formData: any;
	handleInputChange: (field: string, value: string | boolean) => void;
	handleFeatureChange: (featureName: string, checked: boolean) => void;
	handleSubmit: (e: React.FormEvent) => void;
}

const CreatePlanForm: React.FC<CreatePlanFormProps> = ({
	formData,
	handleInputChange,
	handleFeatureChange,
	handleSubmit,
}) => {
	return (
		<Card className="border border-border mb-2">
			<CardHeader>
				<CardTitle>Plan Details</CardTitle>
				<CardDescription>Configure your new subscription plan</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="name">Name *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => handleInputChange("name", e.target.value)}
								placeholder="e.g., Professional"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="price">Price *</Label>
							<Input
								id="price"
								value={formData.price}
								onChange={(e) => handleInputChange("price", e.target.value)}
								placeholder="e.g., 99"
								type="number"
								required
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) => handleInputChange("description", e.target.value)}
							placeholder="Describe what this plan includes..."
							rows={3}
						/>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="billingCycle">Billing Cycle *</Label>
							<Select
								value={formData.billingCycle}
								onValueChange={(value) => handleInputChange("billingCycle", value)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select cycle" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="MONTHLY">Monthly</SelectItem>
									<SelectItem value="YEARLY">Yearly</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="maxForms">Max Forms</Label>
							<Input
								id="maxForms"
								value={formData.maxForms}
								onChange={(e) => handleInputChange("maxForms", e.target.value)}
								placeholder="e.g., 50"
								type="number"
								className="w-full"
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="maxLeadsPerMonth">Max Leads Per Month</Label>
							<Input
								id="maxLeadsPerMonth"
								value={formData.maxLeadsPerMonth}
								onChange={(e) => handleInputChange("maxLeadsPerMonth", e.target.value)}
								placeholder="e.g., 1000"
								type="number"
								className="w-full"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="maxLocations">Max Locations</Label>
							<Input
								id="maxLocations"
								value={formData.maxLocations}
								onChange={(e) => handleInputChange("maxLocations", e.target.value)}
								placeholder="e.g., 5"
								type="number"
								className="w-full"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label>Features</Label>
						<div className="flex flex-col gap-2">
							<div className="flex items-center justify-between">
								<span>Analytics</span>
								<Switch
									id="feature-analytics"
									checked={JSON.parse(formData.features).analytics}
									onCheckedChange={(checked) => handleFeatureChange("analytics", checked)}
								/>
							</div>
							<div className="flex items-center justify-between">
								<span>Custom Branding</span>
								<Switch
									id="feature-custom-branding"
									checked={JSON.parse(formData.features).customBranding}
									onCheckedChange={(checked) => handleFeatureChange("customBranding", checked)}
								/>
							</div>
						</div>
					</div>
					<Button type="submit" className="w-full bg-blue-400 hover:bg-blue-500 text-white text-base font-medium rounded">
						Create New Plan
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};

export default CreatePlanForm;
