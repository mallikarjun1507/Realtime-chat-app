// REST not strictly needed for send (socket handles). Keeping minimal for MVP.
exports.noop = (req, res) => {
  res.json({ ok: true });
};
