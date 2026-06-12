const sysPrompt = `أنت خبير محتوى منتجات وSEO للمتاجر الإلكترونية.
سيتم إعطاؤك اسم منتج فقط.
مهمتك هي كتابة معلومات منتج عملية ومباشرة تساعد العميل على الشراء، بدون أسلوب إنشائي أو مبالغة أو كلام تسويقي فارغ.
اكتب باللهجة العربية المصرية الواضحة، وبنبرة بيع محترمة ومختصرة.
قم بإرجاع تفاصيل هذا المنتج بصيغة JSON فقط، بدون أي نص إضافي.`;

fetch('https://ahmed.red-gate.tech/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'openrouter',
    max_tokens: 1500,
    model: 'google/gemma-4-31b-it:free',
    models: [
      'google/gemma-4-31b-it:free',
      'qwen/qwen3-next-80b-a3b-instruct:free',
      'openrouter/free'
    ],
    messages: [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: 'أوميجا 3 ناو فودز' }
    ]
  })
}).then(res => res.text()).then(console.log).catch(console.error);
