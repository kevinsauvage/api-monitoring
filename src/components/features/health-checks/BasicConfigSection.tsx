import { Globe } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ZodError } from "@/components/ui/zod-error";

export default function BasicConfigSection({
  defaultInterval,
  intervalOptions,
  validationErrors = [],
}: {
  defaultInterval: number;
  intervalOptions: Array<{ value: number; label: string }>;
  validationErrors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Basic Configuration</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="endpoint" className="text-sm font-medium">
              Endpoint *
            </Label>
            <Input
              id="endpoint"
              name="endpoint"
              type="text"
              placeholder="/api/health"
              required
              className="h-11"
            />
            <ZodError errors={validationErrors} fieldName="endpoint" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method" className="text-sm font-medium">
              HTTP Method *
            </Label>
            <Select name="method" defaultValue="GET">
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            <ZodError errors={validationErrors} fieldName="method" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedStatus" className="text-sm font-medium">
              Expected Status Code *
            </Label>
            <Input
              id="expectedStatus"
              name="expectedStatus"
              type="number"
              defaultValue={200}
              min={100}
              max={599}
              required
              className="h-11"
            />
            <ZodError errors={validationErrors} fieldName="expectedStatus" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout" className="text-sm font-medium">
              Timeout (ms) *
            </Label>
            <Input
              id="timeout"
              name="timeout"
              type="number"
              defaultValue={5000}
              min={1000}
              max={30000}
              step={1000}
              required
              className="h-11"
            />
            <ZodError errors={validationErrors} fieldName="timeout" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval" className="text-sm font-medium">
              Check Interval *
            </Label>
            <Select name="interval" defaultValue={defaultInterval.toString()}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                {intervalOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ZodError errors={validationErrors} fieldName="interval" />
          </div>
        </div>
      </div>
    </div>
  );
}
