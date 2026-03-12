import { motion } from 'motion/react';
import { Target, Heart, Award, Users } from 'lucide-react';
import logoImage from '../../assets/MojoDojoLogo.png';
import jadImage from '../../assets/JadPicture.png';
import eddyImage from '../../assets/EddyGPicture.png';
import mikeImage from '../../assets/MikePicture.png';

export function AboutPage() {
  const team = [
    {
      name: 'Jad Haddad',
      role: 'CEO & Co-Founder',
      image: jadImage,
      bio: 'Visionary leader driving MojoDojo\'s mission to redefine premium desserts with discipline and innovation.'
    },
    {
      name: 'Eduardo Muntaner',
      role: 'Co-Founder',
      nickname: 'Eddy G',
      image: eddyImage,
      bio: 'Creative force behind our flavor profiles and brand identity, bringing passion to every creation.'
    },
    {
      name: 'Michael Haddad',
      role: 'Software Developer',
      nickname: 'FatMike',
      image: mikeImage,
      bio: 'Building the digital infrastructure that powers MojoDojo\'s operations and customer experience.'
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Origin Story */}
      <section className="py-24 bg-brand-black" data-page-section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="golden-line pl-6">
                <h2 className="text-4xl font-bold mb-6 premium-heading">
                  Our <span className="gold-accent">Story</span>
                </h2>
                <div className="space-y-4 text-brand-light-gray elegant-text">
                  <p>
                    MojoDojo was born from a simple belief: desserts should be extraordinary, 
                    not ordinary. What started as a passion project has evolved into a disciplined 
                    craft, where every cheesecake, brownie, and tiramisu is made with precision and care.
                  </p>
                  <p>
                    We're not chasing trends or cutting corners. We're building something that lasts — 
                    a brand that people remember, trust, and come back to. Every batch is a statement 
                    of quality. Every order is an opportunity to prove ourselves.
                  </p>
                  <p>
                    From social media orders to a complete brand experience, MojoDojo represents 
                    ambition, consistency, and the relentless pursuit of excellence in every bite.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              <div className="gold-border-beam-wrapper">
                <img src={logoImage} alt="MojoDojo Logo" className="w-full rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-brand-charcoal" data-page-section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 premium-heading">
              What We <span className="gold-accent">Stand For</span>
            </h2>
            <p className="text-lg text-brand-light-gray elegant-text">
              The principles that guide every decision we make
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                title: 'Precision',
                description: 'Every measurement, every temperature, every timing — done right, every time.'
              },
              {
                icon: Heart,
                title: 'Passion',
                description: 'We genuinely care about what we create and the people who enjoy it.'
              },
              {
                icon: Award,
                title: 'Quality',
                description: 'Premium ingredients, proven techniques, and unwavering standards.'
              },
              {
                icon: Users,
                title: 'Consistency',
                description: 'Deliver the same exceptional experience with every single order.'
              }
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="premium-card p-6 text-center"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-gold-subtle mb-4">
                    <Icon className="w-7 h-7 text-brand-gold" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-brand-light-gray elegant-text">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-brand-black" data-page-section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 premium-heading">
              The <span className="gold-accent">Team</span>
            </h2>
            <p className="text-lg text-brand-light-gray elegant-text">
              The people building MojoDojo from the ground up
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="premium-card overflow-hidden"
              >
                <div className="aspect-square relative overflow-hidden bg-brand-dark-gray">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400';
                    }}
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  {member.nickname && (
                    <p className="text-sm gold-accent mb-2">{member.nickname}</p>
                  )}
                  <p className="text-sm text-brand-light-gray mb-3 font-medium">{member.role}</p>
                  <p className="text-sm text-brand-light-gray elegant-text">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
