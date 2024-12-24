export type User = {
  id: string;
  skills: Record<string, number>;
  scores: {
    e_score: number;
    i_score: number;
    b_score: number;
  };
  companies: string[];
  avatar: string;
};
