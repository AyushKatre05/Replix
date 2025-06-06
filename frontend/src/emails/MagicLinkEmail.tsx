import React from "react";
import { Button } from "@react-email/button";
import { Html } from "@react-email/html";
import { Heading } from "@react-email/heading";
import { Text } from "@react-email/text";
import { Hr } from "@react-email/hr";
export default function MagicLinkEmail({
  params,
}: {
  params: { name: string; url: string };
}) {
  return (
    <Html>
      <Heading as="h2"> Hello {params.name} </Heading>
      <Text>
        Here is your Magic link for login and it will be valid only for 15
        minutes.
      </Text>
      <Button
        pX={20}
        pY={20}
        href={params.url}
        style={{ background: "#000", color: "#FFFFFF" }}
      >
        Click Me
      </Button>
      <Hr />

      <Heading as="h3">Regards</Heading>
    </Html>
  );
}