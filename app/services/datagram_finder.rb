class DatagramFinder

  def self.all
    Datagram.where('(frequency > 0 AND frequency is not null) OR (at is not null AND frequency > 0 AND frequency is not null)')
  end

end
