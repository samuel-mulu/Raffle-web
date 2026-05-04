# Ticket Purchase & Payment Integration Plan

This plan outlines the integration of the ticket reservation and payment proof submission workflow into the existing UI, ensuring a consistent premium look and a reliable end-to-end user experience.

## Objectives
- Integrate ticket reservation (`/campaigns/:id/reserve`) with the payment process.
- Refine the payment proof submission UI (`/payment/:ticketId`).
- Improve the admin payment verification experience.
- Ensure automated background cleanup of expired reservations to maintain a healthy ticket pool.

## Proposed Changes

### 1. Frontend: Ticket Reservation Flow Refinement
- **File**: `d:/personal/rafil/raffle-web/src/app/campaigns/[id]/reserve/page.tsx`
- **Actions**:
    - Update the UI to match the premium dark theme used in other parts of the app.
    - Enhance the ticket selection grid for better mobile responsiveness.
    - Add a clear timer display showing the 5-minute reservation window.

### 2. Frontend: Payment Proof Submission UI
- **File**: `d:/personal/rafil/raffle-web/src/app/payment/[ticketId]/page.tsx`
- **Actions**:
    - Complete redesign to match the dark theme.
    - Use the new `FormField` and `Modal` components for the submission form.
    - Add detailed instructions for different payment methods (Telebirr, CBE).
    - Implement a "Copy to Clipboard" feature for merchant codes and account numbers.

### 3. Frontend: Admin Payment Verification
- **File**: `d:/personal/rafil/raffle-web/src/app/admin/payments/page.tsx`
- **Actions**:
    - Refactor the list view into a more professional dashboard layout.
    - Add the ability to view the proof image in a modal instead of a new tab.
    - Improve error handling and success notifications.

### 4. Backend: Algorithm & Reliability Improvements
- **Files**:
    - `d:/personal/rafil/raffle-api/src/tickets/tickets.service.ts`
    - `d:/personal/rafil/raffle-api/src/payments/payments.service.ts`
- **Actions**:
    - **Optimization**: Ensure `reserveTicket` consistently triggers a cleanup of expired reservations for that campaign.
    - **Security**: Double-check that `submitProof` only accepts payments for tickets that are currently in `RESERVED` status and not yet expired.
    - **Automation**: Consider adding a global cron job or a more aggressive hook to clean up expired reservations across all campaigns.

### 5. Frontend: "My Tickets" Dashboard
- **File**: `d:/personal/rafil/raffle-web/src/app/me/tickets/page.tsx`
- **Actions**:
    - Update the status badges to be more descriptive and visually distinct.
    - Add a quick "Pay Now" button for tickets that are still in `RESERVED` status.

## Verification Plan
- **Manual Testing**: Reserve a ticket as a user, verify it shows as "Taken" for others, submit payment proof, and approve it as an admin.
- **Cleanup Test**: Reserve a ticket and let it expire (5 mins) to ensure it returns to the pool and is available for others.
- **Edge Cases**: Attempt to submit proof for an expired ticket; attempt to reserve an already taken ticket.
