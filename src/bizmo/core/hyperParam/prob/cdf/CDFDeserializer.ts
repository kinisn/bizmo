import { CustomDistribution } from './CustomDistribution';
import { NormalDistribution } from './NormalDistribution';
import { TriangleDistribution } from './TriangleDistribution';
import { UniformDistribution } from './UniformDistribution';

export function deserializeCDF(serialized: string): CDFTypes {
    const obj: any = JSON.parse(serialized);
    switch (obj.name) {
        case 'CustomDistribution':
            return CustomDistribution.deserialize(serialized);
        case 'NormalDistribution':
            return NormalDistribution.deserialize(serialized);
        case 'UniformDistribution':
            return UniformDistribution.deserialize(serialized);
        case 'TriangleDistribution':
            return TriangleDistribution.deserialize(serialized);
        default:
            throw new Error('unknown name');
    }
}

export type CDFTypes =
    | CustomDistribution
    | NormalDistribution
    | UniformDistribution
    | TriangleDistribution;
