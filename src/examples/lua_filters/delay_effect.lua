-- Example Lua filter: Simple Delay Effect (Conceptual)

local delay_buffer = {} -- Store delayed samples
local delay_time_ms = 250
local feedback = 0.5
local mix = 0.4
local write_pos = 1
local buffer_size = 0

-- Initialization (called once)
function initialize(sample_rate_hz, max_buffer_size)
  buffer_size = math.floor(sample_rate_hz * (delay_time_ms / 1000))
  -- Initialize delay buffer with zeros
  for i = 1, buffer_size do
    delay_buffer[i] = 0
  end
  print("Lua Delay: Initialized with buffer size " .. buffer_size)
end

-- Process audio buffer
function process_buffer(buffer, num_samples, channels, sample_rate)
  if buffer_size == 0 then initialize(sample_rate, num_samples * channels * 2) end -- Lazy init

  for i = 1, num_samples * channels do
    local read_pos = (write_pos - buffer_size + #delay_buffer) % #delay_buffer + 1
    local delayed_sample = delay_buffer[read_pos] or 0

    local current_sample = buffer:get_sample(i) -- Assuming API provides get/set sample

    local output_sample = current_sample * (1 - mix) + delayed_sample * mix

    -- Store new sample in delay buffer with feedback
    delay_buffer[write_pos] = current_sample + delayed_sample * feedback

    buffer:set_sample(i, output_sample) -- Write back modified sample

    write_pos = (write_pos % #delay_buffer) + 1
  end
end
