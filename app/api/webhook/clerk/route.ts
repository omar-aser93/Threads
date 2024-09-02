// Articles shows why we need webhooks & how to sync data to our backend
// https://clerk.com/docs/integrations/webhooks/overview  ,  https://clerk.com/docs/users/sync-data-to-your-backend 
// It's a good practice to verify webhooks. Article shows why we should do it: https://docs.svix.com/receiving/verifying-payloads/why

import { Webhook, WebhookRequiredHeaders } from "svix";
import { headers } from "next/headers";
import { IncomingHttpHeaders } from "http";
import { NextResponse } from "next/server";
import { addMemberToCommunity, createCommunity, deleteCommunity, removeUserFromCommunity, updateCommunityInfo} from "@/lib/server_actions/community.actions";


//Some Clerk webhooks supported events we need in our app , for list of all events check : Dashboard -> webhooks
type EventType =
  | "organization.created"
  | "organizationInvitation.created"
  | "organizationMembership.created"
  | "organizationMembership.deleted"
  | "organization.updated"
  | "organization.deleted";  

//Typescript type for Event object
type Event = {
  data: Record<string, string | number | Record<string, string>[]>;
  object: "event";
  type: EventType;
};



//POST , a Next API Route for the webhooks events
export const POST = async (request: Request) => {

  const payload = await request.json();            //get req data
  const header = headers();                        //get headers 
  //Activitate Webhook in the Clerk Dashboard, then After adding the endpoint, you'll see the secret on the right side.
  const wh = new Webhook(process.env.NEXT_CLERK_WEBHOOK_SECRET || ""); 
  //using svix lib for webhooks verifications
  const heads = {
    "svix-id": header.get("svix-id"),
    "svix-timestamp": header.get("svix-timestamp"),
    "svix-signature": header.get("svix-signature"),
  };
  
  let evnt: Event | null = null;        //variable to store the event (object || null)
  try {
    //set & verify the event object , passing the req data & svix object 
    evnt = wh.verify( JSON.stringify(payload), heads as IncomingHttpHeaders & WebhookRequiredHeaders ) as Event;
  } catch (err) {
    return NextResponse.json({ message: err },{ status: 400 });         //catch error
  }


  const eventType: EventType = evnt?.type!;    //variable to store event type, so we can check & switch betweenn events

  // Listen to organization creation event
  if (eventType === "organization.created") {
    // Resource: https://clerk.com/docs/reference/backend-api/tag/Organizations#operation/CreateOrganization
    // Show what evnt?.data sends from above resource
    const { id, name, slug, logo_url, image_url, created_by } = evnt?.data ?? {};
    try {
      // @ts-ignore
      await createCommunity(id, name, slug, logo_url || image_url, "org bio", created_by );
      return NextResponse.json({ message: "User created" },{ status: 201 });
    } catch (err) {
      console.log(err);
      return NextResponse.json( { message: "Internal Server Error" },{ status: 500 });
    }
  }

  // Listen to organization invitation creation event.
  // Just to show. You can avoid this or tell people that we can create a new mongoose action and
  // add pending invites in the database.
  if (eventType === "organizationInvitation.created") {
    try {
      // Resource: https://clerk.com/docs/reference/backend-api/tag/Organization-Invitations#operation/CreateOrganizationInvitation
      console.log("Invitation created", evnt?.data);
      return NextResponse.json({ message: "Invitation created" },{ status: 201 });
    } catch (err) {
      console.log(err);
      return NextResponse.json({ message: "Internal Server Error" },{ status: 500 });
    }
  }

  // Listen to organization membership (member invite & accepted) creation
  if (eventType === "organizationMembership.created") {
    try {
      // Resource: https://clerk.com/docs/reference/backend-api/tag/Organization-Memberships#operation/CreateOrganizationMembership
      // Show what evnt?.data sends from above resource
      const { organization, public_user_data } = evnt?.data;
      console.log("created", evnt?.data);
      // @ts-ignore
      await addMemberToCommunity(organization.id, public_user_data.user_id);
      return NextResponse.json({ message: "Invitation accepted" },{ status: 201 });
    } catch (err) {
      console.log(err);
      return NextResponse.json({ message: "Internal Server Error" },{ status: 500 });
    }
  }

  // Listento  member deletion event
  if (eventType === "organizationMembership.deleted") {
    try {
      // Resource: https://clerk.com/docs/reference/backend-api/tag/Organization-Memberships#operation/DeleteOrganizationMembership
      // Show what evnt?.data sends from above resource
      const { organization, public_user_data } = evnt?.data;
      console.log("removed", evnt?.data);
      // @ts-ignore
      await removeUserFromCommunity(public_user_data.user_id, organization.id);
      return NextResponse.json({ message: "Member removed" },{ status: 201 });
    } catch (err) {
      console.log(err);
      return NextResponse.json({ message: "Internal Server Error" },{ status: 500 });
    }
  }

  // Listen to organization updation event
  if (eventType === "organization.updated") {
    try {
      // Resource: https://clerk.com/docs/reference/backend-api/tag/Organizations#operation/UpdateOrganization
      // Show what evnt?.data sends from above resource
      const { id, logo_url, name, slug } = evnt?.data;
      console.log("updated", evnt?.data);
      // @ts-ignore
      await updateCommunityInfo(id, name, slug, logo_url);
      return NextResponse.json({ message: "Member removed" },{ status: 201 });
    } catch (err) {
      console.log(err);
      return NextResponse.json({ message: "Internal Server Error" },{ status: 500 });
    }
  }

  // Listen to organization deletion event
  if (eventType === "organization.deleted") {
    try {
      // Resource: https://clerk.com/docs/reference/backend-api/tag/Organizations#operation/DeleteOrganization
      // Show what evnt?.data sends from above resource
      const { id } = evnt?.data;
      console.log("deleted", evnt?.data);
      // @ts-ignore
      await deleteCommunity(id);
      return NextResponse.json({ message: "Organization deleted" },{ status: 201 });
    } catch (err) {
      console.log(err);
      return NextResponse.json({ message: "Internal Server Error" },{ status: 500 });
    }
  }
};


