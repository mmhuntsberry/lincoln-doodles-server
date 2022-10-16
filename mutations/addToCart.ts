import { KeystoneContext } from "@keystone-next/types";
import { CartItemCreateInput } from "../.keystone/schema-types";
import { Session } from "../types";

export default async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
  console.log(`Adding to cart!!!`);
  // Wuery the current user and see if they are signed in
  const session = context.session as Session;
  if (!session.itemId) {
    throw new Error("You must be logged in!");
  }
  // Query the current users cart
  const allCartItems = await context.lists.CartItem.findMany({
    where: { user: { id: session.itemId }, product: { id: productId } },
    resolveFields: "id, quantity",
  });

  // See if current item is in their cart
  const [existingCartItem] = allCartItems;
  console.log({ existingCartItem });
  if (existingCartItem) {
    console.log(
      `This item is already ${existingCartItem.quantity} in the cart.  Increment by 1!`
    );

    // if it is increment
    return await context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + 1 },
    });
  }

  // else create new cart item
  return await context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: session.itemId } },
    },
    resolveFields: false,
  });
}
