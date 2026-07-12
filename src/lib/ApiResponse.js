export function success(data, status = 200) {
  return Response.json({ success: true, ...data }, { status });
}

export function error(message, status = 500) {
  return Response.json({ success: false, message }, { status });
}
