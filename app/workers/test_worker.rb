class TestWorker

  include Sidekiq::Worker

  def perform (job)
    puts "Doing job #{job}"
  end

end
