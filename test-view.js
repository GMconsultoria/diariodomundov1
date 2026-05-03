fetch('https://diariodomundov2.onrender.com/api/trpc/posts.incrementView', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ slug: "entenda-a-pec-que-pode-extinguir-a-escala-de-trabalho-6x1" }) // I need to get a valid slug first
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
