//
//  PGMethod.cpp
//  Pandora
//
//  Created by Pro_C Mac on 12-12-24.
//
//
#import "DC_JSON.h"
#include "PGMethod.h"

@implementation PGMethod

@synthesize htmlID;
@synthesize featureName, functionName, callBackID, arguments;

/*
 ========================================================================
 * @Summary: 根据读取的Arguments Array 生成PGMethod,
 * @Parameters:
 * @Returns:
 * @Remark:
 * @Changelog:
 ========================================================================
 */
+ (PGMethod*)commandFromJson:(NSArray*)pJsonEntry
{
    PGMethod* pReturnMethod = nil;
    if ([pJsonEntry isKindOfClass:[NSArray class]])
    {
        pReturnMethod = [[[PGMethod alloc] init] autorelease];
        if (pReturnMethod)
        {
            pReturnMethod.htmlID = [pJsonEntry objectAtIndex:0];
            pReturnMethod.featureName = [pJsonEntry objectAtIndex:1];
            pReturnMethod.functionName = [pJsonEntry objectAtIndex:2];
            pReturnMethod.callBackID = [pJsonEntry objectAtIndex:3];
            pReturnMethod.arguments = [pJsonEntry objectAtIndex:4];
        }
    
    }
    return pReturnMethod;
}

/*
 ========================================================================
 * @Summary:
 * @Parameters:
 * @Returns:
 * @Remark:
 * @Changelog:
 ========================================================================
 */
- (void) legacyArguments:(NSMutableArray**)legacyArguments andDict:(NSMutableDictionary**)legacyDict 
{
    NSMutableArray* newArguments = [NSMutableArray arrayWithArray:arguments];
    for (NSUInteger i = 0; i < [newArguments count]; ++i) 
    {
        if ([[newArguments objectAtIndex:i] isKindOfClass:[NSDictionary class]]) 
        {
            if (legacyDict != NULL) 
            {
                *legacyDict = [newArguments objectAtIndex:i];
            }
            [newArguments removeObjectAtIndex:i];
            break;
        }
    }
    
    // Legacy (two versions back) has no callbackId.
    if (callBackID != nil) 
    {
        [newArguments insertObject:callBackID atIndex:0];
    }
    if (legacyArguments != NULL)
    {
        *legacyArguments = newArguments;
    }
}

- (void)dealloc {
    [super dealloc];
}

@end