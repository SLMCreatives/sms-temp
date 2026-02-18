"use client";

import { SelectItem, SelectTrigger } from "@radix-ui/react-select";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectValue
} from "../ui/select";
import { useState } from "react";

export default function SwitchIntake() {
  const [intake, setIntake] = useState("nov25");
  return (
    <div className="bg-background border rounded-2xl drop-shadow-md">
      <Select value={intake} onValueChange={setIntake}>
        <SelectTrigger className=" py-4 w-fit h-fit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position={"item-aligned"}>
          <SelectGroup>
            <SelectLabel>C1</SelectLabel>
            <SelectItem value="nov25">November</SelectItem>
            <SelectItem value="jan26">January</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
