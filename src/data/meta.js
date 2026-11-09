// slug, title, year, rating, duration (approx), genres, cast, description
const rows = [
  ['night-of-the-living-dead', 'Night of the Living Dead', 1968, 'NR', '1h 36m', ['Horror', 'Thriller'], ['Duane Jones', 'Judith O’Dea', 'Karl Hardman'], 'Strangers barricade themselves in a farmhouse as the dead return to life.'],
  ['nosferatu', 'Nosferatu', 1922, 'NR', '1h 34m', ['Horror', 'Fantasy'], ['Max Schreck', 'Gustav von Wangenheim', 'Greta Schröder'], 'A sinister count brings plague and terror to a German port town.'],
  ['metropolis', 'Metropolis', 1927, 'NR', '2h 33m', ['Sci-Fi', 'Drama'], ['Brigitte Helm', 'Alfred Abel', 'Gustav Fröhlich'], 'In a divided future city, a rich man’s son joins the workers’ uprising.'],
  ['a-trip-to-the-moon', 'A Trip to the Moon', 1902, 'NR', '14m', ['Sci-Fi', 'Family'], ['Georges Méliès', 'Bleuette Bernon'], 'Astronomers launch a capsule into the Moon’s eye in cinema’s first sci-fi spectacle.'],
  ['charade', 'Charade', 1963, 'NR', '1h 53m', ['Comedy', 'Thriller', 'Romance'], ['Cary Grant', 'Audrey Hepburn', 'Walter Matthau'], 'A widow in Paris is hunted by men who want her late husband’s hidden fortune.'],
  ['his-girl-friday', 'His Girl Friday', 1940, 'NR', '1h 32m', ['Comedy', 'Romance'], ['Cary Grant', 'Rosalind Russell', 'Ralph Bellamy'], 'A newspaper editor schemes to win back his ex-wife and star reporter.'],
  ['the-general', 'The General', 1926, 'NR', '1h 18m', ['Comedy', 'Action', 'Adventure'], ['Buster Keaton', 'Marion Mack', 'Glen Cavender'], 'A train engineer chases the thieves who stole his locomotive during the Civil War.'],
  ['sherlock-jr', 'Sherlock Jr.', 1924, 'NR', '45m', ['Comedy'], ['Buster Keaton', 'Kathryn McGuire', 'Joe Keaton'], 'A projectionist dreams himself into the movie he is screening.'],
  ['the-kid', 'The Kid', 1921, 'NR', '53m', ['Comedy', 'Drama', 'Family'], ['Charlie Chaplin', 'Jackie Coogan', 'Edna Purviance'], 'A tramp raises an abandoned child and fights to keep him.'],
  ['the-gold-rush', 'The Gold Rush', 1925, 'NR', '1h 35m', ['Comedy', 'Adventure'], ['Charlie Chaplin', 'Mack Swain', 'Georgia Hale'], 'The Little Tramp heads north to strike it rich in the Klondike.'],
  ['the-cabinet-of-dr-caligari', 'The Cabinet of Dr. Caligari', 1920, 'NR', '1h 17m', ['Horror'], ['Werner Krauss', 'Conrad Veidt', 'Lil Dagover'], 'A sleepwalker is used by a sinister showman to commit murders.'],
  ['the-phantom-of-the-opera', 'The Phantom of the Opera', 1925, 'NR', '1h 33m', ['Horror', 'Drama'], ['Lon Chaney', 'Mary Philbin', 'Norman Kerry'], 'A disfigured musician haunts the Paris Opera and obsesses over a young singer.'],
  ['dr-jekyll-and-mr-hyde', 'Dr. Jekyll and Mr. Hyde', 1920, 'NR', '1h 9m', ['Horror'], ['John Barrymore', 'Martha Mansfield', 'Brandon Hurst'], 'A doctor’s experiment unleashes his violent alter ego.'],
  ['carnival-of-souls', 'Carnival of Souls', 1962, 'NR', '1h 18m', ['Horror'], ['Candace Hilligoss', 'Herk Harvey', 'Frances Feist'], 'A car-crash survivor is drawn to an abandoned pavilion and haunted by a ghostly figure.'],
  ['house-on-haunted-hill', 'House on Haunted Hill', 1959, 'NR', '1h 15m', ['Horror'], ['Vincent Price', 'Carol Ohmart', 'Richard Long'], 'A millionaire offers guests $10,000 to survive a night in a haunted mansion.'],
  ['the-last-man-on-earth', 'The Last Man on Earth', 1964, 'NR', '1h 26m', ['Horror', 'Sci-Fi'], ['Vincent Price', 'Franca Bettoia', 'Emma Danieli'], 'The sole survivor of a plague fights nightly against its undead victims.'],
  ['plan-9-from-outer-space', 'Plan 9 from Outer Space', 1957, 'NR', '1h 19m', ['Sci-Fi', 'Horror'], ['Gregory Walcott', 'Tor Johnson', 'Bela Lugosi'], 'Aliens raise the dead to stop humanity from building a doomsday weapon.'],
  ['the-brain-that-wouldnt-die', 'The Brain That Wouldn’t Die', 1962, 'NR', '1h 22m', ['Sci-Fi', 'Horror'], ['Jason Evers', 'Virginia Leith', 'Leslie Daniels'], 'A surgeon keeps his fiancée’s head alive while hunting for a new body.'],
  ['robot-monster', 'Robot Monster', 1953, 'NR', '1h 6m', ['Sci-Fi'], ['George Nader', 'Claudia Barrett', 'Selena Royle'], 'A gorilla-suited alien sets out to wipe out the last humans on Earth.'],
  ['the-terror', 'The Terror', 1963, 'NR', '1h 21m', ['Horror'], ['Boris Karloff', 'Jack Nicholson', 'Sandra Knight'], 'A soldier follows a mysterious woman to a baron’s haunted castle.'],
  ['dementia-13', 'Dementia 13', 1963, 'NR', '1h 15m', ['Horror', 'Thriller'], ['William Campbell', 'Luana Anders', 'Bart Patton'], 'A scheming widow visits an Irish castle where an axe murderer lurks.'],
  ['detour', 'Detour', 1945, 'NR', '1h 8m', ['Drama', 'Thriller'], ['Tom Neal', 'Ann Savage', 'Claudia Drake'], 'A hitchhiker’s cross-country trip spirals into fate and blackmail.'],
  ['d-o-a', 'D.O.A.', 1950, 'NR', '1h 23m', ['Drama', 'Thriller'], ['Edmond O’Brien', 'Pamela Britton', 'Luther Adler'], 'A poisoned man has one day to find out who murdered him.'],
  ['the-stranger', 'The Stranger', 1946, 'NR', '1h 35m', ['Drama', 'Thriller'], ['Orson Welles', 'Edward G. Robinson', 'Loretta Young'], 'A war-crimes investigator tracks a Nazi hiding in a quiet New England town.'],
  ['the-little-shop-of-horrors', 'The Little Shop of Horrors', 1960, 'NR', '1h 12m', ['Comedy', 'Horror'], ['Jonathan Haze', 'Jackie Joseph', 'Mel Welles'], 'A florist’s clerk raises a talking plant that demands human blood.'],
  ['reefer-madness', 'Reefer Madness', 1936, 'NR', '1h 6m', ['Drama'], ['Dorothy Short', 'Kenneth Craig', 'Lillian Miles'], 'A notorious cautionary tale that has become a cult camp classic.'],
  ['intolerance', 'Intolerance', 1916, 'NR', '3h 17m', ['Drama'], ['Lillian Gish', 'Mae Marsh', 'Constance Talmadge'], 'Four stories from different eras explore injustice across history.'],
  ['nanook-of-the-north', 'Nanook of the North', 1922, 'NR', '1h 19m', ['Documentary'], ['Allakariallak', 'Nyla'], 'A landmark silent documentary on an Inuit family’s life in the Arctic.'],
  ['the-plow-that-broke-the-plains', 'The Plow That Broke the Plains', 1936, 'NR', '25m', ['Documentary'], ['Thomas Chalmers'], 'A U.S. government documentary on the farming practices behind the Dust Bowl.'],
  ['the-battle-of-san-pietro', 'The Battle of San Pietro', 1945, 'NR', '32m', ['Documentary'], ['Walter Huston'], 'John Huston’s frontline documentary of the 1943 Italian battle.'],
  ['why-we-fight-prelude-to-war', 'Why We Fight: Prelude to War', 1942, 'NR', '53m', ['Documentary'], ['Walter Huston'], 'The first of Frank Capra’s wartime film series explaining the road to World War II.'],
  ['santa-claus-conquers-the-martians', 'Santa Claus Conquers the Martians', 1964, 'NR', '1h 21m', ['Family', 'Sci-Fi', 'Comedy'], ['John Call', 'Leonard Hicks', 'Vincent Beck'], 'Martians kidnap Santa so their children can have Christmas.'],
  ['the-wonderful-wizard-of-oz', 'The Wizard of Oz', 1925, 'NR', '1h 12m', ['Family', 'Adventure', 'Comedy'], ['Larry Semon', 'Dorothy Dwan', 'Oliver Hardy'], 'A silent, slapstick take on L. Frank Baum’s tale of Oz.'],
  ['peter-pan', 'Peter Pan', 1924, 'NR', '1h 45m', ['Family', 'Adventure'], ['Betty Bronson', 'Ernest Torrence', 'Mary Brian'], 'The boy who never grows up whisks the Darling children off to Neverland.'],
  ['treasure-island', 'Treasure Island', 1920, 'NR', '1h 20m', ['Adventure', 'Family'], ['Shirley Mason', 'Charles Ogle'], 'A young cabin boy sails in search of pirate treasure.'],
  ['robin-hood', 'Robin Hood', 1922, 'NR', '2h 23m', ['Action', 'Adventure'], ['Douglas Fairbanks', 'Wallace Beery', 'Enid Bennett'], 'Douglas Fairbanks swashbuckles as the outlaw of Sherwood Forest.'],
  ['the-thief-of-bagdad', 'The Thief of Bagdad', 1924, 'NR', '2h 20m', ['Adventure', 'Action'], ['Douglas Fairbanks', 'Snitz Edwards', 'Anna May Wong'], 'A thief seeks a magic quest to win a princess.'],
  ['the-mark-of-zorro', 'The Mark of Zorro', 1920, 'NR', '1h 30m', ['Action', 'Adventure'], ['Douglas Fairbanks', 'Marguerite De La Motte', 'Noah Beery'], 'A foppish nobleman secretly fights tyranny as the masked Zorro.'],
  ['the-black-pirate', 'The Black Pirate', 1926, 'NR', '1h 28m', ['Action', 'Adventure'], ['Douglas Fairbanks', 'Billie Dove', 'Donald Crisp'], 'A nobleman infiltrates a pirate crew to avenge his father.'],
  ['ben-hur', 'Ben-Hur: A Tale of the Christ', 1925, 'NR', '2h 22m', ['Drama', 'Adventure'], ['Ramon Novarro', 'Francis X. Bushman', 'May McAvoy'], 'A betrayed Jewish prince seeks revenge in Roman times, climaxing in a chariot race.'],
  ['the-lost-world', 'The Lost World', 1925, 'NR', '1h 32m', ['Sci-Fi', 'Adventure'], ['Wallace Beery', 'Bessie Love', 'Lewis Stone'], 'Explorers discover living dinosaurs on a remote South American plateau.'],
  ['safety-last', 'Safety Last!', 1923, 'NR', '1h 10m', ['Comedy'], ['Harold Lloyd', 'Mildred Davis', 'Bill Strother'], 'A department-store clerk climbs a skyscraper in a famous clock-hanging stunt.']
]

export const META = rows.map(
  ([slug, title, year, rating, duration, genres, cast, description]) => ({
    slug, title, year, rating, duration, genres, cast, description
  })
)
