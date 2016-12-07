class DatagramFinder

  def self.all
    Streamer.where('frequency > 0') + Datagram.where('frequency > 0')
  end

end
