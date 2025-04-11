-- Example Lua filter: Basic 3-Band Equalizer (Conceptual)

-- This function would be called by the C host for each audio buffer
function process_buffer(buffer, num_samples, channels, sample_rate)
  -- TODO: Implement actual EQ logic using buffer access API
  -- Example: Iterate through samples, apply simple IIR/FIR filter coefficients
  -- based on user-defined gain levels for low, mid, high bands.

  print("Lua EQ: Processing " .. num_samples .. " samples.")

  -- The modified buffer is implicitly returned/used by the host
end

-- Potential function to define parameters visible in VLC UI
function get_parameters()
  return {
    { name = "Low Gain", type = "slider", min = -12, max = 12, default = 0 },
    { name = "Mid Gain", type = "slider", min = -12, max = 12, default = 0 },
    { name = "High Gain", type = "slider", min = -12, max = 12, default = 0 },
  }
end
