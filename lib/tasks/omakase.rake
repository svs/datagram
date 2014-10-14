task :stats => "omakase:stats"

namespace :omakase do
  task :stats do
    require 'rails/code_statistics'
    ::STATS_DIRECTORIES << ["Services", "app/services"]
    ::STATS_DIRECTORIES << ["Services Tests", "spec/services"]
    CodeStatistics::TEST_TYPES << 'Services Tests'
  end
end
