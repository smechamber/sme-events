import { Trash2 } from "lucide-react";
import type { TicketTier } from "@events/types";
import { AddItemButton, SectionPanel, inputClass } from "./shared";

export default function BookNow({
  data,
  onChange,
  tickets,
  onTicketsChange,
}: {
  data: any;
  onChange: (value: any) => void;
  tickets: TicketTier[];
  onTicketsChange: (value: TicketTier[]) => void;
}) {
  const value = data ?? { enabled: true, instructions: "" };
  const update = (
    index: number,
    field: keyof TicketTier,
    fieldValue: string | number,
  ) =>
    onTicketsChange(
      tickets.map((ticket, i) =>
        i === index ? { ...ticket, [field]: fieldValue } : ticket,
      ),
    );
  return (
    <SectionPanel title="Booking & Tickets">
      <label className="check-row">
        <input
          type="checkbox"
          checked={value.enabled ?? true}
          onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
        />{" "}
        Enable booking for this event
      </label>
      <label>
        Booking instructions
        <textarea
          className={inputClass}
          value={value.instructions ?? ""}
          onChange={(e) => onChange({ ...value, instructions: e.target.value })}
        />
      </label>
      <div className="repeat-list">
        {tickets.map((ticket, index) => (
          <div className="repeat-card" key={index}>
            <button
              className="icon-button remove"
              type="button"
              onClick={() =>
                onTicketsChange(tickets.filter((_, i) => i !== index))
              }
            >
              <Trash2 size={15} />
            </button>
            <div className="form-grid three">
              <label>
                Ticket name
                <input
                  className={inputClass}
                  value={ticket.name}
                  onChange={(e) => update(index, "name", e.target.value)}
                />
              </label>
              <label>
                Price (₹)
                <input
                  className={inputClass}
                  type="number"
                  value={ticket.price}
                  onChange={(e) =>
                    update(index, "price", Number(e.target.value))
                  }
                />
              </label>
              <label>
                Quantity
                <input
                  className={inputClass}
                  type="number"
                  value={ticket.quantity}
                  onChange={(e) =>
                    update(index, "quantity", Number(e.target.value))
                  }
                />
              </label>
            </div>
            <label>
              Description
              <input
                className={inputClass}
                value={ticket.description}
                onChange={(e) => update(index, "description", e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>
      <AddItemButton
        onClick={() =>
          onTicketsChange([
            ...tickets,
            {
              name: "",
              price: 0,
              description: "",
              quantity: 100,
              isFree: false,
            },
          ])
        }
        label="Add ticket"
      />
    </SectionPanel>
  );
}
