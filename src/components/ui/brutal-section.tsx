import * as React from "react";

export interface BrutalSectionProps extends React.HTMLAttributes<HTMLElement> {
    heading: React.ReactNode;
    children: React.ReactNode;
}

export const BrutalSection = React.forwardRef<HTMLElement, BrutalSectionProps>(
    ({ heading, children, className = "", ...props }, ref) => {
        return (
            <section ref={ref} className={`relative mt-12 mb-16 ${className}`} {...props}>
                <h2 className="absolute -top-6 left-4 z-10 font-black text-2xl uppercase tracking-tight bg-black text-white p-2 border-[4px] border-black inline-block">
                    {heading}
                </h2>
                <div className="pt-8 w-full border-[4px] border-black p-6 bg-white">
                    {children}
                </div>
            </section>
        );
    }
);
BrutalSection.displayName = "BrutalSection";
