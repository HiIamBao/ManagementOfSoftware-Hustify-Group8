import { Controller, Control, FieldValues, Path } from "react-hook-form";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "textarea" | "combobox" | "select";
  options?: { label: string; value: string }[];
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  options = [],
}: FormFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="label">{label}</FormLabel>
          <FormControl>
            {type === "textarea" ? (
              <Textarea placeholder={placeholder} {...field} className="input" />
            ) : type === "combobox" ? (
              <Combobox
                options={options || []}
                value={field.value}
                onChange={field.onChange}
                placeholder={placeholder}
              />
            ) : type === "select" ? (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="input">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options?.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                className="input"
                type={type}
                placeholder={placeholder}
                {...field}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormField;
