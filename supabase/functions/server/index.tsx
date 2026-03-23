// @ts-nocheck
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-44229999/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize database with sample data
app.post("/make-server-44229999/init", async (c) => {
  try {
    // Check if already initialized
    const existing = await kv.get('initialized');
    if (existing) {
      return c.json({ message: "Already initialized", initialized: true });
    }

    // Create admin user
    try {
      const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
        email: 'admin@mojodojo.com',
        password: 'admin123',
        user_metadata: { 
          name: 'Admin User', 
          role: 'admin' 
        },
        email_confirm: true
      });

      if (adminUser?.user) {
        await kv.set(`user:${adminUser.user.id}`, {
          id: adminUser.user.id,
          email: 'admin@mojodojo.com',
          name: 'Admin User',
          role: 'admin',
          created_at: new Date().toISOString()
        });
        console.log('Admin user created successfully');
      } else if (adminError && !adminError.message.includes('already exists')) {
        console.error('Admin user creation error:', adminError);
      }
    } catch (adminErr) {
      console.error('Admin user creation failed:', adminErr);
    }

    // Create initial products
    const initialProducts = [
      {
        id: 'prod_1',
        name: 'Biscoff Cheesecake',
        name_fr: 'Gateau au fromage Biscoff',
        description: 'Rich and creamy cheesecake with a Biscoff cookie crust, topped with caramelized Biscoff spread and cookie crumbles.',
        description_fr: 'Gateau au fromage onctueux sur croute biscuit Biscoff, avec garniture caramelisee et miettes croustillantes.',
        price: 15,
        status: 'available',
        category: 'cheesecake',
        category_fr: 'gateau au fromage',
        serving_size: 'Individual slice',
        serving_size_fr: 'portion individuelle',
        allergy_info: 'Contains dairy, gluten, eggs',
        allergy_info_fr: 'Contient produits laitiers, gluten, oeufs',
        visible: true,
        image: 'figma:asset/312145bbab9fac96704a41479c65000c211ca1ae.png',
        created_at: new Date().toISOString()
      },
      {
        id: 'prod_2',
        name: 'Cheesecake Brownie Tray',
        name_fr: 'Plateau brownie au fromage',
        description: 'Decadent fudgy brownies swirled with velvety cheesecake, perfect for sharing or special occasions.',
        description_fr: 'Brownies fondants marbres de creme au fromage, parfaits pour partager.',
        price: 25,
        status: 'available',
        category: 'tray',
        category_fr: 'dessert en plateau',
        serving_size: '12 pieces',
        serving_size_fr: '12 morceaux',
        allergy_info: 'Contains dairy, gluten, eggs',
        allergy_info_fr: 'Contient produits laitiers, gluten, oeufs',
        visible: true,
        image: 'figma:asset/6b391ecc945330641db08e507f7e8ec764998797.png',
        created_at: new Date().toISOString()
      },
      {
        id: 'prod_3',
        name: 'Tiramisu Tray',
        name_fr: 'Plateau tiramisu',
        description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream, dusted with cocoa.',
        description_fr: 'Dessert italien classique avec biscuits imbibes de cafe, creme mascarpone et cacao.',
        price: 25,
        status: 'available',
        category: 'tray',
        category_fr: 'dessert en plateau',
        serving_size: '12 pieces',
        serving_size_fr: '12 morceaux',
        allergy_info: 'Contains dairy, gluten, eggs, caffeine',
        allergy_info_fr: 'Contient produits laitiers, gluten, oeufs, cafeine',
        visible: true,
        image: 'figma:asset/13cfadf2c294768554cdffe4f2a29ea4ea2a9a32.png',
        created_at: new Date().toISOString()
      }
    ];

    // Store products individually
    for (const product of initialProducts) {
      await kv.set(`product:${product.id}`, product);
    }
    
    // Create initial ingredients
    const initialIngredients = [
      { id: 'ing_1', name: 'Cream Cheese', unit: 'kg', cost_per_unit: 12, stock_quantity: 10, threshold_alert: 3 },
      { id: 'ing_2', name: 'Eggs', unit: 'dozen', cost_per_unit: 5, stock_quantity: 20, threshold_alert: 5 },
      { id: 'ing_3', name: 'Sugar', unit: 'kg', cost_per_unit: 3, stock_quantity: 15, threshold_alert: 5 },
      { id: 'ing_4', name: 'Flour', unit: 'kg', cost_per_unit: 2, stock_quantity: 20, threshold_alert: 5 },
      { id: 'ing_5', name: 'Biscoff Cookies', unit: 'package', cost_per_unit: 8, stock_quantity: 8, threshold_alert: 3 },
      { id: 'ing_6', name: 'Cocoa Powder', unit: 'kg', cost_per_unit: 15, stock_quantity: 5, threshold_alert: 2 },
      { id: 'ing_7', name: 'Mascarpone', unit: 'kg', cost_per_unit: 18, stock_quantity: 6, threshold_alert: 2 },
      { id: 'ing_8', name: 'Espresso', unit: 'g', cost_per_unit: 0.05, stock_quantity: 500, threshold_alert: 100 }
    ];

    // Store ingredients individually
    for (const ingredient of initialIngredients) {
      await kv.set(`ingredient:${ingredient.id}`, {
        ...ingredient,
        created_at: new Date().toISOString()
      });
    }
    
    // Mark as initialized
    await kv.set('initialized', true);

    console.log('Database initialized successfully');
    return c.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Initialize database error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// AUTH ROUTES

// Sign up new user
app.post("/make-server-44229999/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role = 'worker' } = body;

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user role and info in KV
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      created_at: new Date().toISOString()
    });

    return c.json({ user: data.user, success: true });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get current user
app.get("/make-server-44229999/auth/user", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user details from KV
    const userData = await kv.get(`user:${user.id}`);
    
    return c.json({ user: userData || user });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// PRODUCT ROUTES

// Get all products
app.get("/make-server-44229999/products", async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get single product
app.get("/make-server-44229999/products/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create/Update product (admin only)
app.post("/make-server-44229999/products", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'admin') {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const body = await c.req.json();
    const productId = body.id || `prod_${Date.now()}`;
    
    const product = {
      ...body,
      id: productId,
      created_at: body.created_at || new Date().toISOString()
    };

    await kv.set(`product:${productId}`, product);
    
    return c.json({ product, success: true });
  } catch (error) {
    console.error('Create product error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ORDER ROUTES

// Get all orders
app.get("/make-server-44229999/orders", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // If token provided, verify user
    if (accessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (error) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
    }

    const orders = await kv.getByPrefix('order:');
    return c.json({ orders: orders.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) });
  } catch (error) {
    console.error('Get orders error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create order
app.post("/make-server-44229999/orders", async (c) => {
  try {
    const body = await c.req.json();
    const orderId = `order_${Date.now()}`;
    
    const order = {
      ...body,
      id: orderId,
      status: body.status || 'request_received',
      payment_method: body.payment_method || 'arranged_after_approval',
      payment_status: body.payment_status || 'arranged',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`order:${orderId}`, order);
    
    return c.json({ order, success: true });
  } catch (error) {
    console.error('Create order error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update order status (admin only)
app.put("/make-server-44229999/orders/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existingOrder = await kv.get(`order:${id}`);
    if (!existingOrder) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const updatedOrder = {
      ...existingOrder,
      ...body,
      updated_at: new Date().toISOString()
    };

    await kv.set(`order:${id}`, updatedOrder);
    
    return c.json({ order: updatedOrder, success: true });
  } catch (error) {
    console.error('Update order error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// INGREDIENT ROUTES

// Get all ingredients
app.get("/make-server-44229999/ingredients", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const ingredients = await kv.getByPrefix('ingredient:');
    return c.json({ ingredients });
  } catch (error) {
    console.error('Get ingredients error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update ingredient
app.put("/make-server-44229999/ingredients/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existingIngredient = await kv.get(`ingredient:${id}`);
    if (!existingIngredient) {
      return c.json({ error: 'Ingredient not found' }, 404);
    }

    const updatedIngredient = {
      ...existingIngredient,
      ...body
    };

    await kv.set(`ingredient:${id}`, updatedIngredient);
    
    return c.json({ ingredient: updatedIngredient, success: true });
  } catch (error) {
    console.error('Update ingredient error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// GALLERY ROUTES

// Get gallery items
app.get("/make-server-44229999/gallery", async (c) => {
  try {
    const items = await kv.getByPrefix('gallery:');
    return c.json({ items: items.filter(item => item.visible) });
  } catch (error) {
    console.error('Get gallery error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// REVIEWS ROUTES

// Get all reviews
app.get("/make-server-44229999/reviews", async (c) => {
  try {
    const reviews = await kv.getByPrefix('review:');
    const sortedReviews = reviews.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    
    return c.json({ reviews: sortedReviews, averageRating: avgRating, totalReviews: reviews.length });
  } catch (error) {
    console.error('Get reviews error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Submit a review
app.post("/make-server-44229999/reviews", async (c) => {
  try {
    const body = await c.req.json();
    const { name, rating, comment } = body;
    
    if (!name || !rating || !comment) {
      return c.json({ error: 'Name, rating, and comment are required' }, 400);
    }
    
    if (rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }
    
    const reviewId = `review_${Date.now()}`;
    const review = {
      id: reviewId,
      name,
      rating,
      comment,
      created_at: new Date().toISOString()
    };

    await kv.set(`review:${reviewId}`, review);
    
    return c.json({ review, success: true });
  } catch (error) {
    console.error('Submit review error:', error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);