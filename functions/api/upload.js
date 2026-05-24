export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No image uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate unique filename (timestamp + random string)
    const ext = file.name.split('.').pop() || 'jpg';
    const uniqueId = crypto.randomUUID();
    const filename = `properties/${uniqueId}.${ext}`;

    // Upload to Cloudflare R2 using the binding
    // env.MEDIA_BUCKET is the variable name we will set in Cloudflare dashboard
    await env.MEDIA_BUCKET.put(filename, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    // The public URL of the uploaded image
    const publicUrl = `https://media.resurgosy.com/${filename}`;

    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
