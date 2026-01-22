'use client';

import { ExternalLink } from 'lucide-react';

// Azure DevOps URL pattern for searching work items
const ADO_BASE_URL = 'https://cmgfidev.visualstudio.com/_search';

interface TicketLinkProps {
  ticketId: string;
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

/**
 * Generates an Azure DevOps search URL for a ticket
 */
export function getADOUrl(ticketId: string): string {
  // Extract just the numeric part if needed (remove any prefix)
  const numericId = ticketId.replace(/\D/g, '');
  return `${ADO_BASE_URL}?text=${encodeURIComponent(numericId)}&type=workitem`;
}

/**
 * Clickable link component that opens the ticket in Azure DevOps
 */
export function TicketLink({ ticketId, className = '', showIcon = false, children }: TicketLinkProps) {
  if (!ticketId) return null;

  const url = getADOUrl(ticketId);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline transition-colors ${className}`}
      title={`Open ${ticketId} in Azure DevOps`}
    >
      {children || ticketId}
      {showIcon && <ExternalLink className="h-3 w-3" />}
    </a>
  );
}
